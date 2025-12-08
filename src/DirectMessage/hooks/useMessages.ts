import { useCallback, useEffect, useRef, useState } from "react";
import {
	deleteMessage as deleteMessageRequest,
	fetchMessages,
	sendMessage,
	updateMessage as updateMessageRequest,
} from "../api/dm";
import type { DMMessage, SendMessagePayload } from "../types";

interface UseMessagesResult {
	messages: DMMessage[];
	loading: boolean;
	error: string | null;
	send: (payload: SendMessagePayload) => Promise<DMMessage>;
	refresh: () => Promise<void>;
	deleteMessage: (messageId: number) => Promise<DMMessage>;
	editMessage: (messageId: number, body: string) => Promise<DMMessage>;
}

export const useMessages = (
	conversationId: number | null,
): UseMessagesResult => {
	const [messages, setMessages] = useState<DMMessage[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const poller = useRef<number | null>(null);

	const sortByOldest = useCallback((items: DMMessage[]): DMMessage[] => {
		return [...items].sort((a, b) => {
			const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
			const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
			return aTime - bTime;
		});
	}, []);

	const loadMessages = useCallback(
		async (withSpinner: boolean) => {
			if (!conversationId) {
				setMessages([]);
				setError(null);
				return;
			}

			if (withSpinner) {
				setLoading(true);
			}

			try {
				const page = await fetchMessages(conversationId);
				setMessages(sortByOldest(page.items ?? []));
				setError(null);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "メッセージの取得に失敗しました";
				setError(message);
			} finally {
				if (withSpinner) {
					setLoading(false);
				}
			}
		},
		[conversationId, sortByOldest],
	);

	useEffect(() => {
		void loadMessages(true);

		if (poller.current) {
			window.clearInterval(poller.current);
		}

		if (conversationId) {
			poller.current = window.setInterval(() => {
				void loadMessages(false);
			}, 5000);
		}

		return () => {
			if (poller.current) {
				window.clearInterval(poller.current);
				poller.current = null;
			}
		};
	}, [conversationId, loadMessages]);

	const refresh = useCallback(async () => {
		await loadMessages(true);
	}, [loadMessages]);

	const send = useCallback(
		async (payload: SendMessagePayload) => {
			if (!conversationId) {
				throw new Error("会話が選択されていません");
			}

			const message = await sendMessage(conversationId, payload);
			setMessages((previous) => sortByOldest([...previous, message]));
			return message;
		},
		[conversationId, sortByOldest],
	);

	const deleteMessage = useCallback(
		async (messageId: number) => {
			if (!conversationId) {
				throw new Error("会話が選択されていません");
			}

			const updated = await deleteMessageRequest(conversationId, messageId);
			setMessages((previous) =>
				previous.map((message) =>
					message.id === messageId ? { ...message, ...updated } : message,
				),
			);
			return updated;
		},
		[conversationId],
	);

	const editMessage = useCallback(
		async (messageId: number, body: string) => {
			if (!conversationId) {
				throw new Error("会話が選択されていません");
			}
			const updated = await updateMessageRequest(
				conversationId,
				messageId,
				body,
			);
			setMessages((previous) =>
				previous.map((message) =>
					message.id === messageId ? { ...message, ...updated } : message,
				),
			);
			return updated;
		},
		[conversationId],
	);

	return {
		messages,
		loading,
		error,
		send,
		refresh,
		deleteMessage,
		editMessage,
	};
};

export default useMessages;
