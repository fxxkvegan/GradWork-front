import axios from "axios";
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from "../constants/api";
import type {
	AuthResponse,
	LoginRequest,
	PublicUserProfile,
	PublicUserResponse,
	RegisterRequest,
	TokenRefreshResponse,
	UpdateUserSettingsRequest,
	UserHistoryItem,
	UserHistoryResponse,
	UserProfile,
	UserResponse,
	UserSettings,
	UserSettingsResponse,
} from "../types/user";

const AUTH_TOKEN_KEY = "AUTH_TOKEN";
const AUTH_USER_KEY = "AUTH_USER";
const REFRESH_TOKEN_KEY = "refreshToken";

const api = axios.create({
	baseURL: API_CONFIG.BASE_URL,
	timeout: API_CONFIG.TIMEOUT,
});

const mapAuthResponse = (data: AuthResponse): AuthResponse => ({
	token: data.token,
	user: {
		...data.user,
		token: data.token,
	},
});

const clearStoredAuth = () => {
	localStorage.removeItem(AUTH_TOKEN_KEY);
	localStorage.removeItem(AUTH_USER_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const handleAxiosError = (error: unknown, fallbackMessage: string): never => {
	if (axios.isAxiosError(error) && error.response) {
		const payload = error.response.data as { message?: string } | undefined;
		throw new Error(payload?.message || fallbackMessage);
	}
	throw new Error(ERROR_MESSAGES.NETWORK.CONNECTION_ERROR);
};

api.interceptors.request.use((config) => {
	const token = localStorage.getItem(AUTH_TOKEN_KEY);
	if (token) {
		const headers = config.headers ?? {};
		if (typeof (headers as { set?: unknown }).set === "function") {
			(headers as { set: (key: string, value: string) => void }).set(
				"Authorization",
				`Bearer ${token}`,
			);
		} else {
			(headers as Record<string, string>).Authorization = `Bearer ${token}`;
		}
		config.headers = headers;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			clearStoredAuth();
			if (window.location.pathname !== "/login") {
				window.location.assign("/login");
			}
		}
		return Promise.reject(error);
	},
);

export const loginUser = async (
	credentials: LoginRequest,
): Promise<AuthResponse> => {
	try {
		const { data } = await api.post<AuthResponse>(
			API_ENDPOINTS.AUTH.LOGIN,
			credentials,
		);
		return mapAuthResponse(data);
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.AUTH.LOGIN_FAILED);
	}
};

export const registerUser = async (
	userData: RegisterRequest,
): Promise<AuthResponse> => {
	const payload = {
		email: userData.email,
		name: userData.name,
		password: userData.password,
		password_confirmation: userData.password_confirmation,
	};

	try {
		const { data } = await api.post<AuthResponse>(
			API_ENDPOINTS.AUTH.REGISTER,
			payload,
		);
		return mapAuthResponse(data);
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.AUTH.REGISTER_FAILED);
	}
};

export const refreshToken = async (): Promise<TokenRefreshResponse> => {
	const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
	if (!refreshToken) {
		throw new Error(ERROR_MESSAGES.AUTH.NO_REFRESH_TOKEN);
	}

	try {
		const { data } = await api.post<TokenRefreshResponse>(
			API_ENDPOINTS.AUTH.REFRESH,
			{ refreshToken },
		);

		if (data.success && data.data.token) {
			localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
			if (data.data.refreshToken) {
				localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refreshToken);
			}
		}

		return data;
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.AUTH.TOKEN_REFRESH_FAILED);
	}
};

export const logoutUser = async (): Promise<void> => {
	try {
		await api.post(API_ENDPOINTS.AUTH.LOGOUT);
	} catch (error) {
		console.warn("logoutUser: API request failed", error);
	} finally {
		clearStoredAuth();
	}
};

export const getUserProfile = async (): Promise<UserProfile> => {
	try {
		const { data } = await api.get<UserResponse>(API_ENDPOINTS.USERS.PROFILE);
		return data.data;
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.USER.PROFILE_FETCH_FAILED);
	}
};

export const getPublicUserProfile = async (
	userId: number | string,
): Promise<PublicUserProfile> => {
	try {
		const { data } = await api.get<PublicUserResponse>(
			API_ENDPOINTS.USERS.PUBLIC_PROFILE(userId),
		);
		return data.data;
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.USER.PROFILE_FETCH_FAILED);
	}
};

export const updateUserProfile = async (
	formData: FormData,
): Promise<UserProfile> => {
	try {
		const payload = new FormData();
		formData.forEach((value, key) => {
			payload.append(key, value);
		});
		payload.append("_method", "PUT");

		const { data } = await api.post<UserResponse>(
			API_ENDPOINTS.USERS.PROFILE,
			payload,
		);
		return data.data;
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.USER.PROFILE_UPDATE_FAILED);
	}
};

export const getUserSettings = async (): Promise<UserSettings> => {
	try {
		const { data } = await api.get<UserSettingsResponse>(
			API_ENDPOINTS.USERS.SETTINGS,
		);
		return data.data;
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.USER.SETTINGS_FETCH_FAILED);
	}
};

export const updateUserSettings = async (
	settings: UpdateUserSettingsRequest,
): Promise<UserSettings> => {
	try {
		const { data } = await api.put<UserSettingsResponse>(
			API_ENDPOINTS.USERS.SETTINGS,
			settings,
		);
		return data.data;
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.USER.SETTINGS_UPDATE_FAILED);
	}
};

export const getUserHistory = async (
	page: number = 1,
	limit: number = 20,
	action?: string,
): Promise<UserHistoryItem[]> => {
	try {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		if (action) {
			params.append("action", action);
		}

		const { data } = await api.get<UserHistoryResponse>(
			`${API_ENDPOINTS.USERS.HISTORY}?${params.toString()}`,
		);

		return data.data;
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.USER.HISTORY_FETCH_FAILED);
	}
};

export const addHistoryItem = async (
	itemId: string,
	action: "view" | "favorite" | "unfavorite" | "share" | "download",
	metadata?: Record<string, unknown>,
): Promise<UserHistoryItem> => {
	try {
		const { data } = await api.post<{
			message: string;
			data: UserHistoryItem;
		}>(API_ENDPOINTS.USERS.HISTORY, {
			itemId,
			action,
			metadata,
		});

		return data.data;
	} catch (error) {
		return handleAxiosError(error, ERROR_MESSAGES.USER.HISTORY_ADD_FAILED);
	}
};

export const userApi = {
	login: loginUser,
	register: registerUser,
	logout: logoutUser,
	refreshToken,
	getProfile: getUserProfile,
	getPublicProfile: getPublicUserProfile,
	updateProfile: updateUserProfile,
	getSettings: getUserSettings,
	updateSettings: updateUserSettings,
	getHistory: getUserHistory,
	addHistory: addHistoryItem,
};

export default userApi;
