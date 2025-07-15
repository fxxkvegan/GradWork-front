// ユーザー関連の型定義

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    newItems: boolean;
    favorites: boolean;
    security: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showLocation: boolean;
  };
  preferences: {
    itemsPerPage: number;
    defaultView: 'grid' | 'list';
    autoSave: boolean;
  };
  updatedAt: string;
}

export interface UserHistoryItem {
  id: string;
  userId: string;
  itemId: string;
  itemTitle: string;
  itemImage?: string;
  action: 'view' | 'favorite' | 'unfavorite' | 'share' | 'download';
  timestamp: string;
  metadata?: {
    duration?: number; // 閲覧時間（秒）
    source?: string; // アクセス元
    [key: string]: any;
  };
}

// API レスポンス用の型
export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface UserSettingsResponse {
  success: boolean;
  data: UserSettings;
  message?: string;
}

export interface UserHistoryResponse {
  success: boolean;
  data: {
    items: UserHistoryItem[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

// API リクエスト用の型
export interface UpdateUserRequest {
  username?: string;
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
}

export interface UpdateUserSettingsRequest {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  notifications?: Partial<UserSettings['notifications']>;
  privacy?: Partial<UserSettings['privacy']>;
  preferences?: Partial<UserSettings['preferences']>;
}

// 認証関連の型
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
  message?: string;
}

export interface TokenRefreshResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken?: string;
  };
  message?: string;
}
