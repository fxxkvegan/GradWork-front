import { Menu, MenuItem } from "@mui/material";
import type { FC, FormEvent, MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
	onDeleteMessage: (messageId: number) => Promise<unknown>;
	onEditMessage: (messageId: number, body: string) => Promise<unknown>;
}

const MessagePane: FC<MessagePaneProps> = ({
	messages,
	isLoading,
	error,
	currentUserId,
	extraPendingMessage,
	onDeleteMessage,
	onEditMessage,
}) => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		message: DMMessage;
	} | null>(null);
	const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
	const [editValue, setEditValue] = useState("");
	const [editError, setEditError] = useState<string | null>(null);
	const [isSavingEdit, setIsSavingEdit] = useState(false);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		container.scrollTop = container.scrollHeight;
	}, [messages]);

	const visibleMessages = extraPendingMessage
		? [...messages, extraPendingMessage]
		: messages;

	const closeContextMenu = () => {
		setContextMenu(null);
	};

	const handleContextMenu = (
		event: MouseEvent<HTMLDivElement>,
		message: DMMessage,
		isMine: boolean,
	) => {
		const canOpen = isMine && !message.isPending;
		if (!canOpen) {
			return;
		}
		event.preventDefault();
		setContextMenu({
			mouseX: event.clientX - 2,
			mouseY: event.clientY - 4,
			message,
		});
	};

	const startEdit = useCallback((message: DMMessage) => {
		if (!message.body) {
			return;
		}
		setEditingMessageId(message.id);
		setEditValue(message.body);
		setEditError(null);
	}, []);

	const cancelEdit = () => {
		setEditingMessageId(null);
		setEditValue("");
		setEditError(null);
	};

	const handleEditSubmit = async (
		event: FormEvent<HTMLFormElement>,
		messageId: number,
	) => {
		event.preventDefault();
		const trimmed = editValue.trim();
		if (!trimmed) {
			setEditError("メッセージを入力してください");
			return;
		}
		setIsSavingEdit(true);
		setEditError(null);
		try {
			await onEditMessage(messageId, trimmed);
			cancelEdit();
		} catch (error) {
			setEditError(
				error instanceof Error ? error.message : "編集に失敗しました",
			);
		} finally {
			setIsSavingEdit(false);
		}
	};

	const handleMenuEdit = () => {
		if (!contextMenu) return;
		if (!contextMenu.message.body) {
			closeContextMenu();
			return;
		}
		startEdit(contextMenu.message);
		closeContextMenu();
	};

	const handleMenuDelete = () => {
		if (!contextMenu) return;
		const target = contextMenu.message;
		closeContextMenu();
		if (!window.confirm("このメッセージの送信を取り消しますか？")) {
			return;
		}
		void onDeleteMessage(target.id).catch((error) => {
			window.alert(
				error instanceof Error ? error.message : "送信の取り消しに失敗しました",
			);
		});
	};

	const buildDeletedLabel = useCallback((message: DMMessage) => {
		const displayName =
			message.sender?.displayName || message.sender?.name || "このユーザー";
		return `${displayName}さんが送信を取り消しました`;
	}, []);

	const contextMenuState = useMemo(() => {
		if (!contextMenu) {
			return null;
		}
		const { message } = contextMenu;
		return {
			mouseX: contextMenu.mouseX,
			mouseY: contextMenu.mouseY,
			canEdit:
				!!message.body &&
				!message.isDeleted &&
				!message.isPending &&
				message.sender?.id === currentUserId,
			canDelete: !message.isPending && message.sender?.id === currentUserId,
			message,
		};
	}, [contextMenu, currentUserId]);

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
				<>
					{visibleMessages.map((message, index) => {
						const previous = index > 0 ? visibleMessages[index - 1] : undefined;
						const showDateSeparator = !isSameDate(
							message.createdAt,
							previous?.createdAt,
						);
						const isMine =
							currentUserId !== undefined &&
							message.sender?.id === currentUserId;
						const timestamp = formatTime(message.createdAt);
						const senderInitial = getInitial(
							message.sender?.displayName || message.sender?.name,
						);
						const isEditing = editingMessageId === message.id;
						const isDeleted = Boolean(message.isDeleted);
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
											className={`dm-message-bubble ${isMine ? "own" : ""} ${message.isPending ? "pending" : ""} ${isDeleted ? "deleted" : ""}`}
											onContextMenu={(event) =>
												handleContextMenu(event, message, isMine)
											}
										>
											{isEditing ? (
												<form
													className="dm-message-edit-form"
													onSubmit={(event) =>
														handleEditSubmit(event, message.id)
													}
												>
													<textarea
														className="dm-message-edit-textarea"
														value={editValue}
														onChange={(event) =>
															setEditValue(event.target.value)
														}
														placeholder="メッセージを編集"
														autoFocus
													/>
													<div className="dm-message-edit-actions">
														<button type="button" onClick={cancelEdit}>
															キャンセル
														</button>
														<button type="submit" disabled={isSavingEdit}>
															{isSavingEdit ? "保存中..." : "保存"}
														</button>
													</div>
													{editError && (
														<p className="dm-message-edit-error">{editError}</p>
													)}
												</form>
											) : (
												<>
													{isDeleted ? (
														<span className="dm-message-placeholder-text">
															{buildDeletedLabel(message)}
														</span>
													) : (
														<>
															{message.body && <span>{message.body}</span>}
															{message.attachments?.length ? (
																<div className="dm-message-attachments">
																	{message.attachments.map((attachment) => (
																		<div
																			key={attachment.id}
																			className="dm-message-attachment"
																		>
																			<img
																				src={attachment.url}
																				alt="attachment"
																			/>
																		</div>
																	))}
																</div>
															) : null}
														</>
													)}
													{!isDeleted && message.editedAt && (
														<span className="dm-message-edited-label">
															編集済み
														</span>
													)}
													{message.isPending && (
														<span className="dm-message-status">
															送信待ち...
														</span>
													)}
												</>
											)}
											{timestamp && (
												<span className="dm-message-timestamp">
													{timestamp}
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						);
					})}
					<Menu
						open={Boolean(contextMenuState)}
						onClose={closeContextMenu}
						anchorReference="anchorPosition"
						anchorPosition={
							contextMenuState
								? {
										top: contextMenuState.mouseY,
										left: contextMenuState.mouseX,
									}
								: undefined
						}
					>
						<MenuItem
							onClick={handleMenuEdit}
							disabled={!contextMenuState?.canEdit}
						>
							編集
						</MenuItem>
						<MenuItem
							onClick={handleMenuDelete}
							disabled={!contextMenuState?.canDelete}
						>
							送信取り消し
						</MenuItem>
					</Menu>
				</>
			)}
		</div>
	);
};

export default MessagePane;
