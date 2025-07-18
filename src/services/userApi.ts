import axios from 'axios';
import { API_CONFIG } from '../constants/api';
import {
  User,
  UserSettings,
  UserHistoryItem,
  UserResponse,
  UserSettingsResponse,
  UserHistoryResponse,
  UpdateUserRequest,
  UpdateUserSettingsRequest,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenRefreshResponse
} from '../types/user';

// Axios インスタンスの設定
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンを自動追加）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    console.log('userApi.interceptor: リクエスト開始', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      hasToken: !!token,
      tokenSource: localStorage.getItem('authToken') ? 'localStorage' :
        sessionStorage.getItem('authToken') ? 'sessionStorage' : 'none',
      timestamp: new Date().toISOString()
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('userApi.interceptor: 認証トークン追加済み');
    }
    return config;
  },
  (error) => {
    console.error('userApi.interceptor: リクエストエラー', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => {
    console.log('✅ userApi.interceptor: レスポンス受信成功', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      dataReceived: !!response.data,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  async (error) => {
    console.error('userApi.interceptor: レスポンスエラー', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.response?.data?.message,
      timestamp: new Date().toISOString()
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log('🔄 userApi.interceptor: 401エラー - トークンリフレッシュ試行');

      try {
        await refreshToken();
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          console.log('✅ userApi.interceptor: トークンリフレッシュ成功 - リクエスト再実行');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('💥 userApi.interceptor: リフレッシュトークンエラー', refreshError);
        // リフレッシュトークンも無効な場合、ログアウト処理
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        console.log('🚪 userApi.interceptor: 強制ログアウト - ログインページにリダイレクト');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ===== 認証関連 API =====

/**
 * ユーザーログイン
 */
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  console.log('🌐 userApi.loginUser: API呼び出し開始');
  console.log('📤 userApi.loginUser: 送信データ', {
    email: credentials.email,
    passwordProvided: !!credentials.password,
    remember: credentials.remember,
    url: `${api.defaults.baseURL}/auth/login`,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    console.log('✅ userApi.loginUser: API成功レスポンス', {
      status: response.status,
      success: response.data.success,
      userId: response.data.data?.user?.id,
      tokenReceived: !!response.data.data?.token,
      refreshTokenReceived: !!response.data.data?.refreshToken,
      message: response.data.message
    });

    if (response.data.success && response.data.data.token) {
      const storage = credentials.remember ? localStorage : sessionStorage;
      storage.setItem('authToken', response.data.data.token);

      console.log('💾 userApi.loginUser: トークン保存完了', {
        storage: credentials.remember ? 'localStorage' : 'sessionStorage',
        tokenLength: response.data.data.token.length
      });

      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        console.log('💾 userApi.loginUser: リフレッシュトークン保存完了');
      }
    }

    return response.data;
  } catch (error) {
    console.error('💥 userApi.loginUser: API呼び出しエラー', {
      error: error,
      status: axios.isAxiosError(error) ? error.response?.status : 'unknown',
      message: axios.isAxiosError(error) ? error.response?.data?.message : error,
      url: `${api.defaults.baseURL}/auth/login`,
      timestamp: new Date().toISOString()
    });

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || 'ログインに失敗しました');
    }
    throw new Error('ネットワークエラーが発生しました');
  }
};

/**
 * ユーザー登録
 */
export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  console.log('🌐 userApi.registerUser: API呼び出し開始');

  const payload = {
    email: userData.email,
    name: userData.name,
    password: userData.password,
    password_confirmation: userData.password_confirmation,
  };

  console.log('📤 userApi.registerUser: 送信データ', {
    email: payload.email,
    name: payload.name,
    passwordProvided: !!payload.password,
    passwordConfirmationProvided: !!payload.password_confirmation,
    url: `${api.defaults.baseURL}/auth/signup`,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await api.post<AuthResponse>('/auth/signup', payload);

    console.log('✅ userApi.registerUser: API成功レスポンス', {
      status: response.status,
      success: response.data.success,
      userId: response.data.data?.user?.id,
      email: response.data.data?.user?.email,
      tokenReceived: !!response.data.data?.token,
      refreshTokenReceived: !!response.data.data?.refreshToken,
      message: response.data.message
    });

    if (response.data.success && response.data.data.token) {
      sessionStorage.setItem('authToken', response.data.data.token);

      console.log('💾 userApi.registerUser: トークン保存完了 (sessionStorage)');

      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        console.log('💾 userApi.registerUser: リフレッシュトークン保存完了');
      }
    }

    return response.data;
  } catch (error) {
    console.error(' userApi.registerUser: API呼び出しエラー', {
      error: error,
      status: axios.isAxiosError(error) ? error.response?.status : 'unknown',
      message: axios.isAxiosError(error) ? error.response?.data?.message : error,
      url: `${api.defaults.baseURL}/auth/signup`,
      timestamp: new Date().toISOString()
    });

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || 'ユーザー登録に失敗しました');
    }
    throw new Error('ネットワークエラーが発生しました');
  }
};

/**
 * トークンリフレッシュ
 */
export const refreshToken = async (): Promise<TokenRefreshResponse> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('リフレッシュトークンがありません');
    }

    const response = await api.post<TokenRefreshResponse>('/auth/refresh', {
      refreshToken
    });

    if (response.data.success && response.data.data.token) {
      const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
      storage.setItem('authToken', response.data.data.token);

      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || 'トークンの更新に失敗しました');
    }
    throw new Error('ネットワークエラーが発生しました');
  }
};

/**
 * ログアウト
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.warn('ログアウトAPIでエラーが発生しましたが、ローカルトークンを削除します', error);
  } finally {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
};

// ===== ユーザープロフィール API =====

/**
 * 現在のユーザー情報を取得
 */
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get<UserResponse>('/users/me');

    if (!response.data.success) {
      throw new Error(response.data.message || 'ユーザー情報の取得に失敗しました');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || 'ユーザー情報の取得に失敗しました');
    }
    throw new Error('ネットワークエラーが発生しました');
  }
};

/**
 * ユーザー情報を更新
 */
export const updateUserProfile = async (userData: UpdateUserRequest): Promise<User> => {
  try {
    const response = await api.put<UserResponse>('/users/me', userData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'ユーザー情報の更新に失敗しました');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || 'ユーザー情報の更新に失敗しました');
    }
    throw new Error('ネットワークエラーが発生しました');
  }
};

// ===== ユーザー設定 API =====

/**
 * ユーザー設定を取得
 */
export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const response = await api.get<UserSettingsResponse>('/users/me/settings');

    if (!response.data.success) {
      throw new Error(response.data.message || '設定情報の取得に失敗しました');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || '設定情報の取得に失敗しました');
    }
    throw new Error('ネットワークエラーが発生しました');
  }
};

/**
 * ユーザー設定を更新
 */
export const updateUserSettings = async (settings: UpdateUserSettingsRequest): Promise<UserSettings> => {
  try {
    const response = await api.put<UserSettingsResponse>('/users/me/settings', settings);

    if (!response.data.success) {
      throw new Error(response.data.message || '設定の更新に失敗しました');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || '設定の更新に失敗しました');
    }
    throw new Error('ネットワークエラーが発生しました');
  }
};

// ===== ユーザー履歴 API =====

/**
 * ユーザーの履歴を取得
 */
export const getUserHistory = async (
  page: number = 1,
  limit: number = 20,
  action?: string
): Promise<{ items: UserHistoryItem[]; total: number; page: number; limit: number }> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (action) {
      params.append('action', action);
    }

    const response = await api.get<UserHistoryResponse>(`/users/me/history?${params}`);

    if (!response.data.success) {
      throw new Error(response.data.message || '履歴の取得に失敗しました');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || '履歴の取得に失敗しました');
    }
    throw new Error('ネットワークエラーが発生しました');
  }
};

/**
 * 履歴アイテムを追加
 */
export const addHistoryItem = async (
  itemId: string,
  action: 'view' | 'favorite' | 'unfavorite' | 'share' | 'download',
  metadata?: Record<string, any>
): Promise<UserHistoryItem> => {
  try {
    const response = await api.post<{ success: boolean; data: UserHistoryItem; message?: string }>('/users/me/history', {
      itemId,
      action,
      metadata,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || '履歴の追加に失敗しました');
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || '履歴の追加に失敗しました');
    }
    throw new Error('ネットワークエラーが発生しました');
  }
};

// エクスポートされた API関数のデフォルトオブジェクト
export const userApi = {
  // 認証
  login: loginUser,
  register: registerUser,
  logout: logoutUser,
  refreshToken,

  // プロフィール
  getProfile: getUserProfile,
  updateProfile: updateUserProfile,

  // 設定
  getSettings: getUserSettings,
  updateSettings: updateUserSettings,

  // 履歴
  getHistory: getUserHistory,
  addHistory: addHistoryItem,
};

export default userApi;
