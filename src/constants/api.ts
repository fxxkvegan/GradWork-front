export const API_CONFIG = {
    BASE_URL: 'https://app.nice-dig.com',
    TIMEOUT: 10000,
} as const;

// ストレージキー
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
} as const;

// HTTP ステータスコード
export const HTTP_STATUS = {
    UNAUTHORIZED: 401,
} as const;

// API エンドポイント
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
    },
    USERS: {
        PROFILE: '/users/me',
        SETTINGS: '/users/me/settings',
        HISTORY: '/users/me/history',
    },
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
    AUTH: {
        LOGIN_FAILED: 'ログインに失敗しました',
        REGISTER_FAILED: 'ユーザー登録に失敗しました',
        TOKEN_REFRESH_FAILED: 'トークンの更新に失敗しました',
        NO_REFRESH_TOKEN: 'リフレッシュトークンがありません',
    },
    USER: {
        PROFILE_FETCH_FAILED: 'ユーザー情報の取得に失敗しました',
        PROFILE_UPDATE_FAILED: 'ユーザー情報の更新に失敗しました',
        SETTINGS_FETCH_FAILED: '設定情報の取得に失敗しました',
        SETTINGS_UPDATE_FAILED: '設定の更新に失敗しました',
        HISTORY_FETCH_FAILED: '履歴の取得に失敗しました',
        HISTORY_ADD_FAILED: '履歴の追加に失敗しました',
    },
    NETWORK: {
        CONNECTION_ERROR: 'ネットワークエラーが発生しました',
    },
} as const;

// デフォルトページネーション設定
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
} as const;
