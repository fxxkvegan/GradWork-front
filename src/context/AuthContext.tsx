import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useNavigate } from "react-router";
import type { User } from "../types/user";

type StoredUser = Pick<User, "id" | "name" | "email"> & {
	avatarUrl?: string | null;
	headerUrl?: string | null;
	displayName?: string | null;
	bio?: string | null;
	location?: string | null;
	website?: string | null;
	birthday?: string | null;
	locale?: string | null;
	theme?: string | null;
};

interface AuthContextType {
	user: StoredUser | null;
	token: string | null;
	isLoggedIn: boolean;
	login: (userData: User, remember?: boolean) => void;
	logout: () => void;
	updateUser: (payload: Partial<StoredUser>) => void;
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
	const router = useNavigate();

	const [user, setUser] = useState<StoredUser | null>(null);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		setToken(localStorage.getItem(AUTH_TOKEN_KEY));
		setUser(readStoredUser());
	}, []);

	const login = useCallback((userData: User, _remember: boolean = false) => {
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
			headerUrl: userData.header_url ?? null,
			displayName: userData.displayName ?? null,
			bio: userData.bio ?? null,
			location: userData.location ?? null,
			website: userData.website ?? null,
			birthday: userData.birthday ?? null,
			locale: userData.locale ?? null,
			theme: userData.theme ?? null,
		};

		localStorage.setItem(AUTH_TOKEN_KEY, tokenFromResponse);
		localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sanitizedUser));

		setToken(tokenFromResponse);
		setUser(sanitizedUser);
	}, []);

	const logout = useCallback(() => {
		setToken(null);
		setUser(null);
		localStorage.removeItem(AUTH_TOKEN_KEY);
		localStorage.removeItem(AUTH_USER_KEY);
		router("/home");
	}, []);

	const updateUser = useCallback((payload: Partial<StoredUser>) => {
		setUser((previous) => {
			if (!previous) {
				return previous;
			}
			const nextUser: StoredUser = { ...previous, ...payload };
			localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
			return nextUser;
		});
	}, []);

	const value = useMemo(
		() => ({
			user,
			token,
			isLoggedIn: Boolean(token),
			login,
			logout,
			updateUser,
		}),
		[user, token, login, logout, updateUser],
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
