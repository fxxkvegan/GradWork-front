import type { FC } from "react";
import type { DMConversation } from "../types";
import {
	buildSubtitle,
	formatLastUpdated,
	pickAvatarParticipant,
	resolveAvatarFallback,
	resolveDisplayName,
} from "../utils/conversation";

interface ConversationListProps {
	conversations: DMConversation[];
	activeConversationId: number | null;
	onSelect: (conversationId: number) => void;
	loading?: boolean;
	error?: string | null;
	currentUserId?: number | null;
}

const ConversationList: FC<ConversationListProps> = ({
	conversations,
	activeConversationId,
	onSelect,
	loading = false,
	error,
	currentUserId,
}) => {
	if (loading) {
		return (
			<div className="dm-conversation-list dm-sidebar-placeholder">
				読み込み中...
			</div>
		);
	}

	if (error) {
		return (
			<div className="dm-conversation-list dm-sidebar-placeholder">{error}</div>
		);
	}

	if (conversations.length === 0) {
		return (
			<div className="dm-conversation-list dm-sidebar-placeholder">
				まだ会話がありません。
			</div>
		);
	}

	return (
		<div className="dm-conversation-list">
			{conversations.map((conversation) => {
				const participantAvatar = pickAvatarParticipant(
					conversation,
					currentUserId,
				);
				const displayName = resolveDisplayName(conversation, currentUserId);
				const lastUpdated = formatLastUpdated(
					conversation.updatedAt || conversation.lastMessage?.createdAt,
				);
				const unreadCount = conversation.unreadCount ?? 0;
				return (
					<button
						key={conversation.id}
						type="button"
						className={`dm-conversation-item ${conversation.id === activeConversationId ? "active" : ""}`}
						onClick={() => onSelect(conversation.id)}
					>
						<div className="dm-conversation-avatar">
							{participantAvatar?.avatarUrl ? (
								<img src={participantAvatar.avatarUrl} alt={displayName} />
							) : (
								<span>{resolveAvatarFallback(displayName)}</span>
							)}
						</div>
						<div className="dm-conversation-content">
							<div className="dm-conversation-header">
								<span className="dm-conversation-name">{displayName}</span>
								<span className="dm-conversation-time">{lastUpdated}</span>
							</div>
							<span className="dm-conversation-snippet">
								{buildSubtitle(conversation)}
							</span>
						</div>
						{unreadCount > 0 && (
							<div className="dm-unread-badge">
								{unreadCount > 99 ? "99+" : unreadCount}
							</div>
						)}
					</button>
				);
			})}
		</div>
	);
};

export default ConversationList;
