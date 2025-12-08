import axios from "axios";
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from "../../constants/api";
import type {
	CreateConversationPayload,
	DMConversation,
	DMMessage,
	DMMessagePage,
} from "../types";

const AUTH_TOKEN_KEY = "AUTH_TOKEN";

const dmClient = axios.create({
	baseURL: API_CONFIG.BASE_URL,
	timeout: API_CONFIG.TIMEOUT,
});

dmClient.interceptors.request.use((config) => {
	const token = localStorage.getItem(AUTH_TOKEN_KEY);
	if (token) {
		config.headers = config.headers ?? {};
		(config.headers as Record<string, string>).Authorization =
			`Bearer ${token}`;
	}
	return config;
});

const handleAxiosError = (error: unknown, fallbackMessage: string): never => {
	if (axios.isAxiosError(error) && error.response) {
		const data = error.response.data as { message?: string } | undefined;
		throw new Error(data?.message || fallbackMessage);
	}
	throw new Error(ERROR_MESSAGES.NETWORK.CONNECTION_ERROR);
};

export const fetchConversations = async (): Promise<DMConversation[]> => {
	try {
		const { data } = await dmClient.get<{ items?: DMConversation[] }>(
			API_ENDPOINTS.DM.CONVERSATIONS,
		);
		return Array.isArray(data.items) ? data.items : [];
	} catch (error) {
		return handleAxiosError(
			error,
			ERROR_MESSAGES.DM.CONVERSATIONS_FETCH_FAILED,
		);
	}
};

export const createConversation = async (
	payload: CreateConversationPayload,
): Promise<DMConversation> => {
	try {
		const requestBody: Record<string, unknown> = {
			participant_ids: payload.participantIds,
		};
		if (payload.type) {
			requestBody.type = payload.type;
		}
		if (payload.title) {
			requestBody.title = payload.title;
		}
		const { data } = await dmClient.post<DMConversation>(
			API_ENDPOINTS.DM.CONVERSATIONS,
			requestBody,
		);
		return data;
	} catch (error) {
		return handleAxiosError(
			error,
			ERROR_MESSAGES.DM.CREATE_CONVERSATION_FAILED,
		);
	}
};

export const fetchMessages = async (
	conversationId: number,
	perPage: number = 50,
): Promise<DMMessagePage> => {
	try {
		const { data } = await dmClient.get<DMMessagePage>(
			API_ENDPOINTS.DM.MESSAGES(conversationId),
			{ params: { perPage } },
		);
		return data;
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.DM.MESSAGES_FETCH_FAILED);
	}
};

export const sendMessage = async (
	conversationId: number,
	{ body, files }: { body?: string; files: File[] },
): Promise<DMMessage> => {
	const formData = new FormData();
	if (body) {
		formData.append("body", body);
	}
	files.forEach((file) => {
		formData.append("attachments[]", file);
	});

	try {
		const { data } = await dmClient.post<DMMessage>(
			API_ENDPOINTS.DM.MESSAGES(conversationId),
			formData,
		);
		return data;
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.DM.SEND_MESSAGE_FAILED);
	}
};

export const fetchUnreadCount = async (): Promise<number> => {
	try {
		const { data } = await dmClient.get<{ total?: number }>(
			API_ENDPOINTS.DM.UNREAD_COUNT,
		);
		return typeof data.total === "number" ? data.total : 0;
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.DM.UNREAD_COUNT_FETCH_FAILED);
	}
};

interface RawUser {
	id: number;
	name: string;
	display_name?: string | null;
	displayName?: string | null;
	avatar_url?: string | null;
	avatarUrl?: string | null;
}

export const fetchPotentialParticipants = async (): Promise<RawUser[]> => {
	try {
		const { data } = await dmClient.get<{ data?: RawUser[] }>("/users/all");
		return Array.isArray(data.data) ? data.data : [];
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.DM.USER_LIST_FETCH_FAILED);
	}
};
