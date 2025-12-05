import { useCallback, useEffect, useState } from "react";
import { createConversation, fetchConversations } from "../api/dm";
import type { CreateConversationPayload, DMConversation } from "../types";

interface UseConversationsResult {
	conversations: DMConversation[];
	loading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	createConversation: (
		payload: CreateConversationPayload,
	) => Promise<DMConversation>;
}

export const useConversations = (): UseConversationsResult => {
	const [conversations, setConversations] = useState<DMConversation[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		setLoading(true);
		try {
			const items = await fetchConversations();
			setConversations(items);
			setError(null);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "会話の取得に失敗しました";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const handleCreateConversation = useCallback(
		async (payload: CreateConversationPayload) => {
			const conversation = await createConversation(payload);
			setConversations((previous) => {
				const existsIndex = previous.findIndex(
					(item) => item.id === conversation.id,
				);
				if (existsIndex >= 0) {
					const cloned = [...previous];
					cloned[existsIndex] = conversation;
					return cloned;
				}

				return [conversation, ...previous];
			});
			return conversation;
		},
		[],
	);

	return {
		conversations,
		loading,
		error,
		refresh,
		createConversation: handleCreateConversation,
	};
};

export default useConversations;
