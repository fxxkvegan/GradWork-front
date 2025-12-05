import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import notificationApi from "../services/notificationApi";
import type { ReviewNotification } from "../types/notification";
import { useAuth } from "./AuthContext";

interface NotificationContextValue {
	notifications: ReviewNotification[];
	unreadNotifications: ReviewNotification[];
	unreadCount: number;
	loading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	markAsRead: (ids: string | string[]) => Promise<void>;
	markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
	undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
	const { isLoggedIn } = useAuth();
	const [notifications, setNotifications] = useState<ReviewNotification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		if (!isLoggedIn) {
			setNotifications([]);
			setUnreadCount(0);
			setError(null);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const { items, unreadCount: nextUnread } =
				await notificationApi.fetchReviewNotifications();
			setNotifications(items);
			setUnreadCount(nextUnread);
		} catch (apiError) {
			const message =
				apiError instanceof Error
					? apiError.message
					: "通知の取得に失敗しました";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, [isLoggedIn]);

	useEffect(() => {
		if (!isLoggedIn) {
			setNotifications([]);
			setUnreadCount(0);
			setError(null);
			return;
		}

		void refresh();
	}, [isLoggedIn, refresh]);

	const markAsRead = useCallback(
		async (ids: string | string[]) => {
			const targetIds = Array.isArray(ids) ? ids : [ids];
			if (targetIds.length === 0) {
				return;
			}

			const targetSet = new Set(targetIds);
			let newlyRead = 0;
			const timestamp = new Date().toISOString();

			setNotifications((previous) =>
				previous.map((notification) => {
					if (!targetSet.has(notification.id) || notification.isRead) {
						return notification;
					}
					newlyRead += 1;
					return {
						...notification,
						isRead: true,
						readAt: notification.readAt ?? timestamp,
					};
				}),
			);

			if (newlyRead > 0) {
				setUnreadCount((previous) => Math.max(0, previous - newlyRead));
			}

			try {
				const { unreadCount: nextUnread } =
					await notificationApi.markReviewNotificationsRead(targetIds);
				setUnreadCount(nextUnread);
			} catch (apiError) {
				const message =
					apiError instanceof Error
						? apiError.message
						: "通知の更新に失敗しました";
				setError(message);
				await refresh();
			}
		},
		[refresh],
	);

	const markAllAsRead = useCallback(async () => {
		if (notifications.length === 0) {
			return;
		}

		const timestamp = new Date().toISOString();
		setNotifications((previous) =>
			previous.map((notification) =>
				notification.isRead
					? notification
					: {
							...notification,
							isRead: true,
							readAt: notification.readAt ?? timestamp,
						},
			),
		);
		setUnreadCount(0);

		try {
			const { unreadCount: nextUnread } =
				await notificationApi.markAllReviewNotificationsRead();
			setUnreadCount(nextUnread);
		} catch (apiError) {
			const message =
				apiError instanceof Error
					? apiError.message
					: "通知の更新に失敗しました";
			setError(message);
			await refresh();
		}
	}, [notifications.length, refresh]);

	const unreadNotifications = useMemo(
		() => notifications.filter((notification) => !notification.isRead),
		[notifications],
	);

	const value = useMemo<NotificationContextValue>(
		() => ({
			notifications,
			unreadNotifications,
			unreadCount,
			loading,
			error,
			refresh,
			markAsRead,
			markAllAsRead,
		}),
		[
			notifications,
			unreadNotifications,
			unreadCount,
			loading,
			error,
			refresh,
			markAsRead,
			markAllAsRead,
		],
	);

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			"useNotifications must be used within a NotificationProvider",
		);
	}
	return context;
};
