export interface User {
	id: number;
	name: string;
	email: string;
	token?: string;
	avatar_url?: string | null;
	header_url?: string | null;
	displayName?: string | null;
	bio?: string | null;
	location?: string | null;
	website?: string | null;
	birthday?: string | null;
	locale?: string | null;
	theme?: string | null;
	email_verified_at?: string | null;
	created_at?: string;
	updated_at?: string;
}

interface BaseUserProfile {
	id: number;
	name: string;
	displayName?: string | null;
	avatarUrl?: string | null;
	headerUrl?: string | null;
	bio?: string | null;
	location?: string | null;
	website?: string | null;
	birthday?: string | null;
	locale?: string | null;
	theme?: string | null;
	followersCount?: number;
	followingCount?: number;
	isFollowing?: boolean | null;
}

export interface UserProfile extends BaseUserProfile {
	email: string;
	productsCount?: number;
	joinedAt?: string | null;
}

export interface PublicUserProfile extends BaseUserProfile {
	productsCount: number;
	joinedAt?: string | null;
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

export interface PublicUserResponse {
	message: string;
	data: PublicUserProfile;
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
	displayName?: string;
	email?: string;
	avatarUrl?: string;
	headerUrl?: string;
	bio?: string;
	location?: string;
	website?: string;
	birthday?: string;
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
