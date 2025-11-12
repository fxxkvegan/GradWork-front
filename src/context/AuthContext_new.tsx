import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { getUserProfile, logoutUser } from "../services/userApi";
import { User } from "../types/user";

// 認証コンテキストの型定義
interface AuthContextType {
	user: User | null;
	isLoggedIn: boolean;
	login: (userData: User, remember?: boolean) => void;
	logout: () => Promise<void>;
	loading: boolean;
	refreshUser: () => Promise<void>;
}

// ストレージキー
const USER_STORAGE_KEY = "user";

// デフォルト値
const defaultContext: AuthContextType = {
	user: null,
	isLoggedIn: false,
	login: () => {},
	logout: async () => {},
	loading: true,
	refreshUser: async () => {},
};

// コンテキストの作成
const AuthContext = createContext<AuthContextType>(defaultContext);

// AuthContextのプロバイダーコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// ユーザー情報を更新する関数
	const refreshUser = async () => {
		const token =
			localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
		if (token) {
			try {
				const userData = await getUserProfile();
				setUser(userData);
			} catch (error) {
				console.error("Failed to refresh user data:", error);
				// トークンが無効な場合はログアウト
				await handleLogout();
			}
		}
	};

	// 初期化時にユーザー情報を取得
	useEffect(() => {
		const initializeAuth = async () => {
			const token =
				localStorage.getItem("authToken") ||
				sessionStorage.getItem("authToken");

			if (token) {
				try {
					// トークンがある場合はAPIからユーザー情報を取得
					const userData = await getUserProfile();
					setUser(userData);
				} catch (error) {
					console.error("Failed to load user from API:", error);
					// APIエラーの場合はトークンを削除
					localStorage.removeItem("authToken");
					sessionStorage.removeItem("authToken");
					localStorage.removeItem("refreshToken");
				}
			} else {
				// トークンがない場合はローカルストレージから取得（フォールバック）
				const storedUserLocal = localStorage.getItem(USER_STORAGE_KEY);
				const storedUserSession = sessionStorage.getItem(USER_STORAGE_KEY);

				if (storedUserLocal) {
					try {
						const parsedUser = JSON.parse(storedUserLocal);
						setUser(parsedUser);
					} catch (error) {
						console.error(
							"Failed to parse user data from localStorage:",
							error,
						);
						localStorage.removeItem(USER_STORAGE_KEY);
					}
				} else if (storedUserSession) {
					try {
						const parsedUser = JSON.parse(storedUserSession);
						setUser(parsedUser);
					} catch (error) {
						console.error(
							"Failed to parse user data from sessionStorage:",
							error,
						);
						sessionStorage.removeItem(USER_STORAGE_KEY);
					}
				}
			}

			setLoading(false);
		};

		initializeAuth();
	}, []);

	// ログイン処理
	const login = (userData: User, remember: boolean = false) => {
		setUser(userData);

		// ユーザー情報をストレージに保存（フォールバック用）
		if (remember) {
			localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
		} else {
			sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
		}
	};

	// ログアウト処理
	const handleLogout = async () => {
		try {
			await logoutUser();
		} catch (error) {
			console.error("Logout API error:", error);
		} finally {
			setUser(null);
			// すべてのストレージからユーザー情報を削除
			localStorage.removeItem(USER_STORAGE_KEY);
			sessionStorage.removeItem(USER_STORAGE_KEY);
			localStorage.removeItem("authToken");
			sessionStorage.removeItem("authToken");
			localStorage.removeItem("refreshToken");
		}
	};

	const value = {
		user,
		isLoggedIn: !!user,
		login,
		logout: handleLogout,
		loading,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 認証情報を使用するためのカスタムフック
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export default AuthContext;
