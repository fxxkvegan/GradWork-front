import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../types/user";

type StoredUser = Pick<User, "id" | "name" | "email"> & {
	avatarUrl?: string | null;
	locale?: string | null;
	theme?: string | null;
};

interface AuthContextType {
	user: StoredUser | null;
	token: string | null;
	isLoggedIn: boolean;
	login: (userData: User, remember?: boolean) => void;
	logout: () => void;
}

const AUTH_USER_KEY = "AUTH_USER";
const AUTH_TOKEN_KEY = "AUTH_TOKEN";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readStoredUser = (): StoredUser | null => {
	const raw = localStorage.getItem(AUTH_USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as StoredUser;
	} catch (error) {
		console.warn("AuthContext: failed to parse stored user", error);
		localStorage.removeItem(AUTH_USER_KEY);
		return null;
	}
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<StoredUser | null>(null);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		setToken(localStorage.getItem(AUTH_TOKEN_KEY));
		setUser(readStoredUser());
	}, []);

	const login = (userData: User, _remember: boolean = false) => {
		const tokenFromResponse = userData.token;
		if (!tokenFromResponse || typeof tokenFromResponse !== "string") {
			console.warn("AuthContext.login called without token");
			return;
		}

		const sanitizedUser: StoredUser = {
			id: userData.id,
			name: userData.name,
			email: userData.email,
			avatarUrl: userData.avatar_url ?? null,
			locale: userData.locale ?? null,
			theme: userData.theme ?? null,
		};

		localStorage.setItem(AUTH_TOKEN_KEY, tokenFromResponse);
		localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sanitizedUser));

		setToken(tokenFromResponse);
		setUser(sanitizedUser);
	};

	const logout = () => {
		setToken(null);
		setUser(null);
		localStorage.removeItem(AUTH_TOKEN_KEY);
		localStorage.removeItem(AUTH_USER_KEY);
		window.location.assign("/login");
	};

	const value = useMemo(
		() => ({
			user,
			token,
			isLoggedIn: Boolean(token),
			login,
			logout,
		}),
		[user, token],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export default AuthContext;
