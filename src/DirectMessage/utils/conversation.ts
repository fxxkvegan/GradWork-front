import type { DMConversation, DMParticipant } from "../types";
import { getInitial } from "./formatters";

const UNKNOWN_LABEL = "Unknown";
const NO_MESSAGES_LABEL = "メッセージはまだありません";
const GENERIC_MESSAGE_LABEL = "メッセージ";
const GROUP_FALLBACK = "グループチャット";

const findCounterparty = (
	participants: DMParticipant[],
	currentUserId?: number | null,
): DMParticipant | undefined =>
	participants.find((participant) =>
		currentUserId ? participant.id !== currentUserId : true,
	);

export const resolveDisplayName = (
	conversation: DMConversation,
	currentUserId?: number | null,
): string => {
	if (conversation.displayName) return conversation.displayName;
	if (conversation.type === "group")
		return conversation.title || GROUP_FALLBACK;
	const other = findCounterparty(conversation.participants, currentUserId);
	return other?.displayName || other?.name || UNKNOWN_LABEL;
};

export const pickAvatarParticipant = (
	conversation: DMConversation,
	currentUserId?: number | null,
): DMParticipant | undefined => {
	if (conversation.type === "group") {
		return conversation.participants[0];
	}
	return findCounterparty(conversation.participants, currentUserId);
};

export const buildSubtitle = (conversation: DMConversation): string => {
	const lastMessage = conversation.lastMessage;
	if (!lastMessage) return NO_MESSAGES_LABEL;
	if (lastMessage.body) return lastMessage.body;
	if (lastMessage.hasAttachments) return "画像を送信しました";
	return GENERIC_MESSAGE_LABEL;
};

export const formatLastUpdated = (value?: string | null): string => {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("ja-JP", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

export const resolveAvatarFallback = (label?: string): string =>
	getInitial(label);
