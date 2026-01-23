/* eslint-disable react-refresh/only-export-components */
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
import {
	getEmailVerificationStatus,
	resendEmailVerification,
} from "../services/userApi";
import type { User } from "../types/user";
import { clearAllTokens, getAuthToken, saveAuthToken } from "../utils/auth";

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
	isVerified: boolean;
	emailVerifiedAt: string | null;
	login: (userData: User) => void;
	logout: () => void;
	updateUser: (payload: Partial<StoredUser>) => void;
	refreshEmailStatus: () => Promise<void>;
	resendVerificationEmail: () => Promise<void>;
}

const AUTH_USER_KEY = "AUTH_USER";

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
	// const [isVerified, setIsVerified] = useState<boolean>(true);
	const [emailVerifiedAt, setEmailVerifiedAt] = useState<string | null>(null);

	useEffect(() => {
		// cleanup legacy token key
		localStorage.removeItem("AUTH_TOKEN");
		sessionStorage.removeItem("AUTH_TOKEN");
		setToken(getAuthToken());
		setUser(readStoredUser());
	}, []);

	const refreshEmailStatus = useCallback(async () => {
		if (!getAuthToken()) {
			setEmailVerifiedAt(null);
			return;
		}
		try {
			const status = await getEmailVerificationStatus();
			// setIsVerified(status.verified);
			setEmailVerifiedAt(status.email_verified_at);
		} catch (error) {
			console.warn("AuthContext: failed to fetch email status", error);
		}
	}, []);

	const login = useCallback((userData: User) => {
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

		saveAuthToken(tokenFromResponse, true);
		localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sanitizedUser));

		setToken(tokenFromResponse);
		setUser(sanitizedUser);
		// setIsVerified(Boolean(userData.email_verified_at));
		setEmailVerifiedAt(userData.email_verified_at ?? null);
	}, []);

	const logout = useCallback(() => {
		setToken(null);
		setUser(null);
		setEmailVerifiedAt(null);
		clearAllTokens();
		localStorage.removeItem(AUTH_USER_KEY);
		router("/home");
	}, [router]);

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
			isVerified: true,
			emailVerifiedAt,
			login,
			logout,
			updateUser,
			refreshEmailStatus,
			resendVerificationEmail: async () => {
				try {
					const status = await resendEmailVerification();
					// setIsVerified(status.verified);
					// setIsVerified(true);
					setEmailVerifiedAt(status.email_verified_at);
				} catch (error) {
					console.warn("AuthContext: failed to resend verification", error);
				}
			},
		}),
		[
			user,
			token,
			emailVerifiedAt,
			login,
			logout,
			updateUser,
			refreshEmailStatus,
		],
	);

	useEffect(() => {
		if (token) {
			void refreshEmailStatus();
		}
	}, [token, refreshEmailStatus]);

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
