import type { FC } from "react";
import { useEffect, useRef } from "react";
import type { DMMessage } from "../types";
import {
	formatDateLabel,
	formatTime,
	getInitial,
	isSameDate,
} from "../utils/formatters";

interface MessagePaneProps {
	messages: DMMessage[];
	isLoading: boolean;
	error?: string | null;
	currentUserId?: number | null;
	extraPendingMessage?: DMMessage | null;
}

const MessagePane: FC<MessagePaneProps> = ({
	messages,
	isLoading,
	error,
	currentUserId,
	extraPendingMessage,
}) => {
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		container.scrollTop = container.scrollHeight;
	}, [messages]);

	const visibleMessages = extraPendingMessage
		? [...messages, extraPendingMessage]
		: messages;

	return (
		<div className="dm-messages-container" ref={containerRef}>
			{isLoading ? (
				<div className="dm-messages-placeholder">読み込み中...</div>
			) : error ? (
				<div className="dm-messages-placeholder">{error}</div>
			) : messages.length === 0 ? (
				<div className="dm-messages-placeholder">
					最初のメッセージを送信してみましょう。
				</div>
			) : (
				visibleMessages.map((message, index) => {
					const previous = index > 0 ? visibleMessages[index - 1] : undefined;
					const showDateSeparator = !isSameDate(
						message.createdAt,
						previous?.createdAt,
					);
					const isMine =
						currentUserId !== undefined && message.sender?.id === currentUserId;
					const timestamp = formatTime(message.createdAt);
					const senderInitial = getInitial(
						message.sender?.displayName || message.sender?.name,
					);
					return (
						<div
							key={`${message.id}-${message.isPending ? "pending" : "sent"}`}
						>
							{showDateSeparator && (
								<div className="dm-date-separator">
									{formatDateLabel(message.createdAt)}
								</div>
							)}
							<div className={`dm-message-group ${isMine ? "own" : ""}`}>
								{!isMine && (
									<div className="dm-message-avatar">
										{message.sender?.avatarUrl ? (
											<img
												src={message.sender.avatarUrl}
												alt={
													message.sender.displayName ||
													message.sender?.name ||
													"sender"
												}
											/>
										) : (
											<span>{senderInitial}</span>
										)}
									</div>
								)}
								<div className={`dm-message-content ${isMine ? "own" : ""}`}>
									{!isMine && (
										<span className="dm-message-sender">
											{message.sender?.displayName ||
												message.sender?.name ||
												"ユーザー"}
										</span>
									)}
									<div
										className={`dm-message-bubble ${isMine ? "own" : ""} ${message.isPending ? "pending" : ""}`}
									>
										{message.body && <span>{message.body}</span>}
										{message.attachments?.length ? (
											<div className="dm-message-attachments">
												{message.attachments.map((attachment) => (
													<div
														key={attachment.id}
														className="dm-message-attachment"
													>
														<img src={attachment.url} alt="attachment" />
													</div>
												))}
											</div>
										) : null}
										{timestamp && (
											<span className="dm-message-timestamp">{timestamp}</span>
										)}
										{message.isPending && (
											<span className="dm-message-status">送信待ち...</span>
										)}
									</div>
								</div>
							</div>
						</div>
					);
				})
			)}
		</div>
	);
};

export default MessagePane;
