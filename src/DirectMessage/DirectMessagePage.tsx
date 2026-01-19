import { ArrowBack } from "@mui/icons-material";
import { Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import { useAuth } from "../context/AuthContext";
import { useDmNotifications } from "../context/DmNotificationContext";
import ConversationList from "./components/ConversationList";
import MessageInput from "./components/MessageInput";
import MessagePane from "./components/MessagePane";
import NewConversationDialog from "./components/NewConversationDialog";
import useConversations from "./hooks/useConversations";
import useMessages from "./hooks/useMessages";
import type { CreateConversationPayload, SendMessagePayload } from "./types";
import "./directMessage.css";

const DirectMessagePage = () => {
	const { user, isLoggedIn } = useAuth();
	const [isDialogOpen, setDialogOpen] = useState(false);
	const [selectedConversationId, setSelectedConversationId] = useState<
		number | null
	>(null);
	const [mobileView, setMobileView] = useState<"list" | "chat">("list");
	const [searchKeyword, setSearchKeyword] = useState("");
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const {
		conversations,
		loading: conversationsLoading,
		error: conversationsError,
		refresh: refreshConversations,
		createConversation,
		markConversationAsRead,
	} = useConversations();

	const {
		messages,
		loading: messagesLoading,
		error: messagesError,
		send,
		deleteMessage,
		editMessage,
	} = useMessages(selectedConversationId);
	const { refresh: refreshDmUnread } = useDmNotifications();

	const refreshDmIndicators = useCallback(async () => {
		await Promise.all([refreshConversations(), refreshDmUnread()]);
	}, [refreshConversations, refreshDmUnread]);

	const handleDeleteMessage = useCallback(
		async (messageId: number) => {
			await deleteMessage(messageId);
			await refreshDmIndicators();
		},
		[deleteMessage, refreshDmIndicators],
	);

	const handleEditMessage = useCallback(
		async (messageId: number, body: string) => {
			const trimmed = body.trim();
			if (!trimmed) {
				throw new Error("メッセージを入力してください");
			}
			await editMessage(messageId, trimmed);
			await refreshDmIndicators();
		},
		[editMessage, refreshDmIndicators],
	);

	useEffect(() => {
		if (conversations.length === 0) {
			setSelectedConversationId(null);
			if (isMobile) {
				setMobileView("list");
			}
			return;
		}

		const hasSelectedConversation = conversations.some(
			(conversation) => conversation.id === selectedConversationId,
		);

		if (hasSelectedConversation) {
			return;
		}

		if (isMobile) {
			setSelectedConversationId(null);
			setMobileView("list");
			return;
		}

		setSelectedConversationId(conversations[0].id);
	}, [conversations, selectedConversationId, isMobile]);

	useEffect(() => {
		if (!isMobile) {
			setMobileView("chat");
			return;
		}

		if (selectedConversationId) {
			setMobileView("chat");
		} else {
			setMobileView("list");
		}
	}, [isMobile, selectedConversationId]);

	const filteredConversations = useMemo(() => {
		if (!searchKeyword.trim()) {
			return conversations;
		}
		return conversations.filter((conversation) => {
			const displayName =
				conversation.displayName ||
				conversation.title ||
				conversation.participants.map((p) => p.displayName || p.name).join(" ");
			return displayName
				?.toLowerCase()
				.includes(searchKeyword.trim().toLowerCase());
		});
	}, [conversations, searchKeyword]);

	const activeConversation = useMemo(() => {
		return (
			filteredConversations.find(
				(conversation) => conversation.id === selectedConversationId,
			) ?? null
		);
	}, [filteredConversations, selectedConversationId]);

	const conversationTitle =
		activeConversation?.displayName || activeConversation?.title || "会話";
	const conversationSubtitle = activeConversation
		? activeConversation.participants
				.filter((participant) => participant.id !== user?.id)
				.map((participant) => participant.displayName || participant.name)
				.join(", ") || "1対1の会話"
		: "";

	const handleCreateConversation = async (
		payload: CreateConversationPayload,
	) => {
		const conversation = await createConversation(payload);
		setSelectedConversationId(conversation.id);
		setDialogOpen(false);
		if (isMobile) {
			setMobileView("chat");
		}
	};

	const handleSendMessage = async (payload: SendMessagePayload) => {
		try {
			await send(payload);
			await refreshDmIndicators();
		} catch (error) {
			window.alert("メッセージの送信に失敗しました");
		}
	};

	const handleBackToList = () => {
		if (!isMobile) return;
		setMobileView("list");
		setSelectedConversationId(null);
	};

	if (!isLoggedIn) {
		return (
			<div className="dm-page">
				<AppHeaderWithAuth activePath="/dm" />
				<div className="dm-empty-state">
					<Typography variant="h5">ログインが必要です</Typography>
					<Typography variant="body2">
						DM機能を利用するには、ログインしてください。
					</Typography>
					<Button variant="contained" href="/login">
						ログインへ
					</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			<AppHeaderWithAuth activePath="/dm" />
			<div className="dm-page">
				{(!isMobile || mobileView === "list") && (
					<aside className="dm-sidebar">
						<div className="dm-search-container">
							<div className="dm-search-wrapper">
								<input
									type="text"
									className="dm-search-input"
									placeholder="メッセージを検索"
									value={searchKeyword}
									onChange={(event) => setSearchKeyword(event.target.value)}
								/>
							</div>
						</div>
						<ConversationList
							conversations={filteredConversations}
							activeConversationId={selectedConversationId}
							onSelect={(conversationId) => {
								setSelectedConversationId(conversationId);
								markConversationAsRead(conversationId);
								void refreshDmUnread();
								if (isMobile) {
									setMobileView("chat");
								}
							}}
							loading={conversationsLoading}
							error={conversationsError}
							currentUserId={user?.id}
						/>
						<button
							type="button"
							className="dm-new-dm-button"
							onClick={() => setDialogOpen(true)}
						>
							新しいDM
						</button>
					</aside>
				)}

				{(!isMobile || mobileView === "chat") && (
					<section className="dm-chat-container">
						{activeConversation ? (
							<>
								<header className="dm-chat-header">
									{isMobile && (
										<button
											type="button"
											className="dm-back-button"
											onClick={handleBackToList}
											aria-label="会話一覧に戻る"
										>
											<ArrowBack fontSize="small" />
										</button>
									)}
									<div className="dm-header-content">
										<p className="dm-header-title">{conversationTitle}</p>
										<p className="dm-header-subtitle">{conversationSubtitle}</p>
									</div>
								</header>
								<MessagePane
									messages={messages}
									isLoading={messagesLoading}
									error={messagesError}
									currentUserId={user?.id}
									extraPendingMessage={null}
									onDeleteMessage={handleDeleteMessage}
									onEditMessage={handleEditMessage}
								/>
								<MessageInput
									onSend={handleSendMessage}
									disabled={!activeConversation}
									restoredPayload={null}
								/>
							</>
						) : (
							<div className="dm-empty-state">
								<p>会話が選択されていません</p>
								<p>
									{isMobile
										? "メッセージしたい相手を選ぶと、ここに会話が表示されます。"
										: "左のリストから会話を選択するか、新しいDMを開始してください。"}
								</p>
							</div>
						)}
					</section>
				)}
			</div>
			<NewConversationDialog
				open={isDialogOpen}
				onClose={() => setDialogOpen(false)}
				onCreate={handleCreateConversation}
				currentUserId={user?.id}
			/>
		</>
	);
};

export default DirectMessagePage;
