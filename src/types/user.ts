export interface User {
	id: number;
	name: string;
	email: string;
	avatar_url?: string | null;
	locale?: string | null;
	theme?: string | null;
	email_verified_at?: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface UserProfile {
	id: number;
	name: string;
	email: string;
	avatarUrl?: string | null;
	locale?: string | null;
	theme?: string | null;
}

export interface UserSettings {
	locale: string | null;
	theme: string | null;
}

export interface UserHistoryItem {
	id: string;
	userId: string;
	itemId: string;
	itemTitle: string;
	itemImage?: string;
	action: "view" | "favorite" | "unfavorite" | "share" | "download";
	timestamp: string;
	metadata?: {
		duration?: number;
		source?: string;
		[key: string]: unknown;
	};
}

export interface UserResponse {
	message: string;
	data: UserProfile;
}

export interface UserSettingsResponse {
	message: string;
	data: UserSettings;
}

export interface UserHistoryResponse {
	message: string;
	data: UserHistoryItem[];
}

export interface UpdateUserRequest {
	name?: string;
	email?: string;
	avatarUrl?: string;
	locale?: string;
	theme?: string;
}

export interface UpdateUserSettingsRequest {
	locale?: string;
	theme?: string;
}

// 認証関連の型
export interface LoginRequest {
	email: string;
	password: string;
	remember?: boolean;
}

export interface RegisterRequest {
	email: string;
	name: string;
	password: string;
	password_confirmation: string;
}

export interface AuthResponse {
	token: string;
	user: User;
}

export interface TokenRefreshResponse {
	success: boolean;
	data: {
		token: string;
		refreshToken?: string;
	};
	message?: string;
}
