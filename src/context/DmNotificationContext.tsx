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
import { fetchUnreadCount } from "../DirectMessage/api/dm";
import { useAuth } from "./AuthContext";

interface DmNotificationContextValue {
	unreadCount: number;
	loading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
}

const POLL_INTERVAL_MS = 15000;

const DmNotificationContext = createContext<
	DmNotificationContextValue | undefined
>(undefined);

export const DmNotificationProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const { isLoggedIn, isVerified } = useAuth();
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadUnreadCount = useCallback(
		async (options?: { silent?: boolean }) => {
			const silent = options?.silent ?? false;
			if (!isLoggedIn) {
				setUnreadCount(0);
				setError(null);
				if (!silent) {
					setLoading(false);
				}
				return;
			}

			if (!isVerified) {
				setUnreadCount(0);
				setError(
					"メール認証が完了していません。DMを確認するには認証が必要です。",
				);
				if (!silent) {
					setLoading(false);
				}
				return;
			}

			if (!silent) {
				setLoading(true);
			}
			setError(null);
			try {
				const total = await fetchUnreadCount();
				setUnreadCount(total);
			} catch (apiError) {
				const message =
					apiError instanceof Error
						? apiError.message
						: "DM通知の取得に失敗しました";
				setError(message);
			} finally {
				if (!silent) {
					setLoading(false);
				}
			}
		},
		[isLoggedIn, isVerified],
	);

	const refresh = useCallback(async () => {
		await loadUnreadCount({ silent: false });
	}, [loadUnreadCount]);

	useEffect(() => {
		loadUnreadCount({ silent: false }).catch(() => {
			// 初期ロード時のエラーは state に設定済み
		});
	}, [loadUnreadCount]);

	useEffect(() => {
		if (!isLoggedIn || !isVerified) {
			return;
		}
		const intervalId = window.setInterval(() => {
			loadUnreadCount({ silent: true }).catch(() => {
				// ポーリング時のエラーは state に設定済み
			});
		}, POLL_INTERVAL_MS);
		return () => {
			window.clearInterval(intervalId);
		};
	}, [isLoggedIn, isVerified, loadUnreadCount]);

	const value = useMemo<DmNotificationContextValue>(
		() => ({ unreadCount, loading, error, refresh }),
		[unreadCount, loading, error, refresh],
	);

	return (
		<DmNotificationContext.Provider value={value}>
			{children}
		</DmNotificationContext.Provider>
	);
};

export const useDmNotifications = () => {
	const context = useContext(DmNotificationContext);
	if (!context) {
		throw new Error(
			"useDmNotifications must be used within a DmNotificationProvider",
		);
	}
	return context;
};
