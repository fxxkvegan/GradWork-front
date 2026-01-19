import { Menu, MenuItem } from "@mui/material";
import type { FC, FormEvent, KeyboardEvent, MouseEvent } from "react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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

const EDIT_TEXTAREA_MIN_HEIGHT = 96;
const SCROLL_BOTTOM_THRESHOLD_PX = 32;

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
	const messageBubbleRefs = useRef(new Map<number, HTMLDivElement>());
	const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		message: DMMessage;
	} | null>(null);
	const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
	const [editValue, setEditValue] = useState("");
	const [editDimensions, setEditDimensions] = useState<{
		width: number;
		height: number;
	} | null>(null);
	const [editError, setEditError] = useState<string | null>(null);
	const [isSavingEdit, setIsSavingEdit] = useState(false);
	const [isAtBottom, setIsAtBottom] = useState(true);
	const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);
	const resizeEditTextarea = useCallback(() => {
		const textarea = editTextareaRef.current;
		if (!textarea) {
			return;
		}
		textarea.style.height = "auto";
		const baseHeight = editDimensions?.height ?? EDIT_TEXTAREA_MIN_HEIGHT;
		textarea.style.height = `${Math.max(textarea.scrollHeight, baseHeight)}px`;
	}, [editDimensions]);

	const scrollToBottom = useCallback(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}
		container.scrollTop = container.scrollHeight;
	}, []);

	const handleScroll = useCallback(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}
		const distanceFromBottom =
			container.scrollHeight - (container.scrollTop + container.clientHeight);
		const atBottom = distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD_PX;
		setIsAtBottom(atBottom);
		if (atBottom) {
			setHasNewMessagesBelow(false);
		}
	}, []);

	const visibleMessages = extraPendingMessage
		? [...messages, extraPendingMessage]
		: messages;
	const previousMessageCountRef = useRef(visibleMessages.length);

	useEffect(() => {
		const nextCount = visibleMessages.length;
		const prevCount = previousMessageCountRef.current;
		if (nextCount <= prevCount) {
			previousMessageCountRef.current = nextCount;
			return;
		}
		if (isAtBottom) {
			requestAnimationFrame(() => {
				scrollToBottom();
				setHasNewMessagesBelow(false);
				setIsAtBottom(true);
			});
		} else {
			setHasNewMessagesBelow(true);
		}
		previousMessageCountRef.current = nextCount;
	}, [isAtBottom, scrollToBottom, visibleMessages.length]);

	const handleNewMessagesClick = useCallback(() => {
		scrollToBottom();
		setHasNewMessagesBelow(false);
		setIsAtBottom(true);
	}, [scrollToBottom]);

	// Keep the edit textarea sized to its content so longer messages stay readable.
	useLayoutEffect(() => {
		if (editingMessageId === null) {
			return;
		}
		resizeEditTextarea();
	}, [editingMessageId, editValue, resizeEditTextarea]);

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
		const bubble = messageBubbleRefs.current.get(message.id);
		if (bubble) {
			setEditDimensions({
				width: bubble.clientWidth,
				height: bubble.clientHeight,
			});
		} else {
			setEditDimensions(null);
		}
		setEditingMessageId(message.id);
		setEditValue(message.body);
		setEditError(null);
	}, []);

	const cancelEdit = useCallback(() => {
		setEditingMessageId(null);
		setEditValue("");
		setEditError(null);
		setEditDimensions(null);
	}, []);

	const submitEdit = useCallback(
		async (messageId: number) => {
			if (isSavingEdit) {
				return;
			}
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
		},
		[cancelEdit, editValue, isSavingEdit, onEditMessage],
	);

	const handleEditSubmit = (
		event: FormEvent<HTMLFormElement>,
		messageId: number,
	) => {
		event.preventDefault();
		void submitEdit(messageId);
	};

	const handleEditKeyDown = (
		event: KeyboardEvent<HTMLTextAreaElement>,
		messageId: number,
	) => {
		if (event.key === "Escape") {
			event.preventDefault();
			cancelEdit();
			return;
		}
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			void submitEdit(messageId);
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
		// Removed confirmation dialog as per user request
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
		<div
			className="dm-messages-container"
			ref={containerRef}
			onScroll={handleScroll}
		>
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
						const showMeta =
							!isEditing &&
							(Boolean(timestamp) || (!isDeleted && Boolean(message.editedAt)));
						// For Discord style, we always show timestamp in the header line if it's a new group or strict time diff
						// But simplifying for now: show header (Avatar+Name) if different user OR time gap > X (not implemented yet)
						// For now, let's show header for every message for simplicity, or just group by user if close?
						// Discord shows avatar for first message in a group.
						// Let's implement simple grouping: if same sender as previous and within short time, hide avatar/header
						const isSameSender = previous?.sender?.id === message.sender?.id;
						// const isCloseTime = ... (omitted for simplicity, just check sender)

						// NOTE: To make it truly Discord-like we should group messages.
						// For this iteration, let's keep it simple: EVERY message has avatar+header (Cozy mode).
						// Or strive for "Compact" mode later. Let's do Standard Discord (Grouped).

						// Actually, let's stick to "Cozy" (standard) but maybe not group strictly yet to reduce risk of logic bugs.
						// We'll show Avatar+Header for every message for now to ensure clarity.

						if (isDeleted) {
							return (
								<div
									key={`${message.id}-${message.isPending ? "pending" : "sent"}`}
									className="dm-message-item dm-message-item-deleted"
								>
									{showDateSeparator && (
										<div className="dm-date-separator">
											{formatDateLabel(message.createdAt)}
										</div>
									)}
									<div className="dm-system-message">
										<span className="dm-system-message-text">
											{buildDeletedLabel(message)}
										</span>
										{timestamp && (
											<span className="dm-system-message-time">
												{timestamp}
											</span>
										)}
									</div>
								</div>
							);
						}

						return (
							<div
								key={`${message.id}-${message.isPending ? "pending" : "sent"}`}
								className="dm-message-item"
							>
								{showDateSeparator && (
									<div className="dm-date-separator">
										{formatDateLabel(message.createdAt)}
									</div>
								)}
								<div className={`dm-message-group ${isMine ? "own" : ""}`}>
									{/* Avatar (Only for others) */}
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

									<div className="dm-message-content">
										{/* Sender Name (Only for others if group start? simplified: always show for non-grouped) */}
										{!isMine && (
											<div className="dm-message-sender-name">
												{message.sender?.displayName || message.sender?.name}
											</div>
										)}

										<div className="dm-message-bubble-row">
											<div
												className={`dm-message-bubble ${isMine ? "own" : ""} ${message.isPending ? "pending" : ""}`}
												ref={(element) => {
													if (!element) {
														messageBubbleRefs.current.delete(message.id);
														return;
													}
													messageBubbleRefs.current.set(message.id, element);
												}}
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
															ref={editTextareaRef}
															onChange={(event) =>
																setEditValue(event.target.value)
															}
															onKeyDown={(event) =>
																handleEditKeyDown(event, message.id)
															}
															placeholder="メッセージを編集"
															autoFocus
															style={{
																minHeight: "40px",
																width: "100%",
																color:
																	"#333" /* Ensure text is visible in edit mode */,
															}}
														/>
														<div className="dm-message-edit-actions">
															<button type="button" onClick={cancelEdit}>
																キャンセル
															</button>
															<button type="submit" disabled={isSavingEdit}>
																保存
															</button>
														</div>
														<p className="dm-message-edit-hint">
															Escキーでキャンセル・Enterキーで保存
														</p>
														{editError && (
															<p className="dm-message-edit-error">
																{editError}
															</p>
														)}
													</form>
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
														{/* Removed pending status text as requested */}
													</>
												)}
											</div>

											{/* Metadata (Time, Edit Status) - Placed beside bubble */}
											{showMeta && (
												<div
													className={`dm-message-meta-side ${isMine ? "own" : "other"}`}
												>
													{timestamp && (
														<span className="dm-message-timestamp">
															{timestamp}
														</span>
													)}
													{!isDeleted && message.editedAt && (
														<span className="dm-message-edited-label">
															(編集済)
														</span>
													)}
												</div>
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
			{!isLoading && !error && hasNewMessagesBelow && (
				<button
					type="button"
					className="dm-new-messages-banner"
					onClick={handleNewMessagesClick}
				>
					新着メッセージが下にあります
				</button>
			)}
		</div>
	);
};

export default MessagePane;
