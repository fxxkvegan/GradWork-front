import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// ユーザー情報の型定義
interface User {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    accessToken?: string;
    role?: string; // テストユーザー用のロール情報
}

// 認証コンテキストの型定義
interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (userData: User, remember?: boolean) => void;
    logout: () => void;
    loading: boolean;
}

// ストレージキー
const USER_STORAGE_KEY = 'user';
const TEST_USER_STORAGE_KEY = 'testLoginUser';

// デフォルト値
const defaultContext: AuthContextType = {
    user: null,
    isLoggedIn: false,
    login: () => { },
    logout: () => { },
    loading: true
};

// コンテキストの作成
const AuthContext = createContext<AuthContextType>(defaultContext);

// AuthContextのプロバイダーコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 初期化時にストレージからユーザー情報を取得
    useEffect(() => {
        const loadUserFromStorage = () => {
            // テストユーザー情報を最初にチェック（優先度高）
            const storedTestUser = localStorage.getItem(TEST_USER_STORAGE_KEY);
            if (storedTestUser) {
                try {
                    const parsedUser = JSON.parse(storedTestUser);
                    setUser(parsedUser);
                    setLoading(false);
                    return; // テストユーザーが見つかったら他のストレージはチェックしない
                } catch (error) {
                    console.error('Failed to parse test user data:', error);
                    localStorage.removeItem(TEST_USER_STORAGE_KEY);
                }
            }

            // 通常のユーザー情報をチェック
            // localStorageを次にチェック
            const storedUserLocal = localStorage.getItem(USER_STORAGE_KEY);
            if (storedUserLocal) {
                try {
                    const parsedUser = JSON.parse(storedUserLocal);
                    setUser(parsedUser);
                } catch (error) {
                    console.error('Failed to parse user data from localStorage:', error);
                    localStorage.removeItem(USER_STORAGE_KEY);
                }
            } else {
                // sessionStorageを最後にチェック
                const storedUserSession = sessionStorage.getItem(USER_STORAGE_KEY);
                if (storedUserSession) {
                    try {
                        const parsedUser = JSON.parse(storedUserSession);
                        setUser(parsedUser);
                    } catch (error) {
                        console.error('Failed to parse user data from sessionStorage:', error);
                        sessionStorage.removeItem(USER_STORAGE_KEY);
                    }
                }
            }
            setLoading(false);
        };

        loadUserFromStorage();
    }, []);

    // ログイン処理
    const login = (userData: User, remember: boolean = false) => {
        setUser(userData);

        // テストユーザーかどうかを判断（ロールが設定されているかで判断）
        if (userData.role) {
            // テストユーザーの場合は常にlocalStorageに保存（永続化）
            localStorage.setItem(TEST_USER_STORAGE_KEY, JSON.stringify(userData));
        } else {
            // 通常のユーザーの場合は設定に応じて保存先を決定
            if (remember) {
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
            } else {
                sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
            }
        }
    };    // ログアウト処理
    const logout = () => {
        setUser(null);
        // すべてのストレージからユーザー情報を削除
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TEST_USER_STORAGE_KEY);
        sessionStorage.removeItem(USER_STORAGE_KEY);
    };

    const value = {
        user,
        isLoggedIn: !!user,
        login,
        logout,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 認証情報を使用するためのカスタムフック
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;