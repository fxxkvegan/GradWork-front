export const API_CONFIG = {
	BASE_URL: "https://app.nice-dig.com/api",
	TIMEOUT: 10000,
} as const;

// ストレージキー
export const STORAGE_KEYS = {
	AUTH_TOKEN: "authToken",
	REFRESH_TOKEN: "refreshToken",
} as const;

// HTTP ステータスコード
export const HTTP_STATUS = {
	UNAUTHORIZED: 401,
} as const;

const joinPath = (base: string, suffix?: string) =>
	suffix ? `${base}/${suffix}` : base;

const userPath = (userId: number | string, suffix?: string) =>
	joinPath(`/users/${userId}`, suffix);

const userMePath = (suffix?: string) => joinPath("/users/me", suffix);

// API エンドポイント
export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: "/auth/login",
		REGISTER: "/auth/signup",
		LOGOUT: "/auth/logout",
		REFRESH: "/auth/refresh",
	},
	USERS: {
		PROFILE: userMePath(),
		PUBLIC_PROFILE: (userId: number | string) => userPath(userId),
		SETTINGS: userMePath("settings"),
		HISTORY: userMePath("history"),
		FOLLOW: (userId: number | string) => userPath(userId, "follow"),
	},
	NOTIFICATIONS: {
		REVIEW_LIST: userMePath("notifications/reviews"),
		REVIEW_MARK_READ: userMePath("notifications/reviews/read"),
		REVIEW_MARK_ALL_READ: userMePath("notifications/reviews/read-all"),
	},
	DM: {
		CONVERSATIONS: "/dm/conversations",
		MESSAGES: (conversationId: number | string) =>
			`/dm/conversations/${conversationId}/messages`,
		MESSAGE: (conversationId: number | string, messageId: number | string) =>
			`/dm/conversations/${conversationId}/messages/${messageId}`,
		UNREAD_COUNT: "/dm/unread-count",
	},
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
	AUTH: {
		LOGIN_FAILED: "ログインに失敗しました",
		REGISTER_FAILED: "ユーザー登録に失敗しました",
		TOKEN_REFRESH_FAILED: "トークンの更新に失敗しました",
		NO_REFRESH_TOKEN: "リフレッシュトークンがありません",
	},
	USER: {
		PROFILE_FETCH_FAILED: "ユーザー情報の取得に失敗しました",
		PROFILE_UPDATE_FAILED: "ユーザー情報の更新に失敗しました",
		SETTINGS_FETCH_FAILED: "設定情報の取得に失敗しました",
		SETTINGS_UPDATE_FAILED: "設定の更新に失敗しました",
		HISTORY_FETCH_FAILED: "履歴の取得に失敗しました",
		HISTORY_ADD_FAILED: "履歴の追加に失敗しました",
		FOLLOW_FAILED: "フォローに失敗しました",
		UNFOLLOW_FAILED: "フォロー解除に失敗しました",
	},
	NOTIFICATION: {
		FETCH_FAILED: "通知の取得に失敗しました",
		MARK_FAILED: "通知の更新に失敗しました",
	},
	DM: {
		CONVERSATIONS_FETCH_FAILED: "会話リストの取得に失敗しました",
		CREATE_CONVERSATION_FAILED: "会話の作成に失敗しました",
		MESSAGES_FETCH_FAILED: "メッセージの取得に失敗しました",
		SEND_MESSAGE_FAILED: "メッセージの送信に失敗しました",
		UPDATE_MESSAGE_FAILED: "メッセージの編集に失敗しました",
		DELETE_MESSAGE_FAILED: "メッセージの送信を取り消せませんでした",
		UNREAD_COUNT_FETCH_FAILED: "未読DM件数の取得に失敗しました",
		USER_LIST_FETCH_FAILED: "ユーザー一覧の取得に失敗しました",
	},
	NETWORK: {
		CONNECTION_ERROR: "ネットワークエラーが発生しました",
	},
} as const;

// デフォルトページネーション設定
export const PAGINATION = {
	DEFAULT_PAGE: 1,
	DEFAULT_LIMIT: 20,
} as const;
