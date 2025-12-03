import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import productApi from "../services/productApi";
import type { ReviewNotification } from "../types/notification";
import type { Product } from "../types/product";
import type { Review } from "../types/review";
import { useAuth } from "./AuthContext";

interface NotificationContextValue {
	notifications: ReviewNotification[];
	unreadNotifications: ReviewNotification[];
	unreadCount: number;
	loading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	markAsRead: (ids: string | string[]) => void;
	markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
	undefined,
);

const READ_STORAGE_PREFIX = "READ_REVIEW_NOTICES_";

const pickPrimaryImage = (product: Product): string | null => {
	if (Array.isArray(product.image_url) && product.image_url.length > 0) {
		return product.image_url[0];
	}
	if (typeof product.image_url === "string" && product.image_url !== "") {
		return product.image_url;
	}
	return null;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
	const { isLoggedIn, user } = useAuth();
	const [notifications, setNotifications] = useState<ReviewNotification[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [readIds, setReadIds] = useState<Set<string>>(new Set());

	const storageKey = useMemo(() => {
		if (!user) {
			return null;
		}
		return `${READ_STORAGE_PREFIX}${user.id}`;
	}, [user]);

	useEffect(() => {
		if (!storageKey) {
			setReadIds(new Set());
			return;
		}

		try {
			const stored = localStorage.getItem(storageKey);
			if (!stored) {
				setReadIds(new Set());
				return;
			}
			const parsed = JSON.parse(stored);
			if (Array.isArray(parsed)) {
				setReadIds(new Set(parsed as string[]));
				return;
			}
			localStorage.removeItem(storageKey);
			setReadIds(new Set());
		} catch (storageError) {
			console.warn("Failed to parse read notification ids", storageError);
			setReadIds(new Set());
		}
	}, [storageKey]);

	const persistReadIds = useCallback(
		(next: Set<string>) => {
			if (!storageKey) {
				return;
			}
			localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
		},
		[storageKey],
	);

	const refresh = useCallback(async () => {
		if (!isLoggedIn || !user) {
			setNotifications([]);
			setError(null);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const myProducts = await productApi.fetchMyProducts();
			if (myProducts.length === 0) {
				setNotifications([]);
				return;
			}

			type ProductReviews = { product: Product; reviews: Review[] };
			const perProductResults = await Promise.allSettled(
				myProducts.map(async (product): Promise<ProductReviews> => {
					const response = await productApi.fetchProductReviews(product.id);
					return {
						product,
						reviews: response.data ?? [],
					};
				}),
			);

			const nextNotifications: ReviewNotification[] = [];
			perProductResults.forEach((result) => {
				if (result.status !== "fulfilled") {
					console.error("Failed to load reviews", result.reason);
					return;
				}
				const { product, reviews } = result.value;
				reviews
					.filter((review) => review.author_id !== user.id)
					.forEach((review) => {
						nextNotifications.push({
							id: `${product.id}-${review.id}`,
							productId: product.id,
							productName: product.name,
							productImage: pickPrimaryImage(product),
							reviewId: review.id,
							reviewerName: review.author_name ?? "匿名ユーザー",
							reviewerAvatar: review.author_avatar_url ?? null,
							rating: review.rating,
							title: review.title,
							body: review.body,
							createdAt: review.created_at,
						});
					});
			});

			nextNotifications.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);

			setNotifications(nextNotifications);

			setReadIds((previous) => {
				const next = new Set(
					Array.from(previous).filter((id) =>
						nextNotifications.some((notification) => notification.id === id),
					),
				);
				persistReadIds(next);
				return next;
			});
		} catch (refreshError) {
			console.error(refreshError);
			setError("通知の取得に失敗しました");
		} finally {
			setLoading(false);
		}
	}, [isLoggedIn, persistReadIds, user]);

	useEffect(() => {
		if (!isLoggedIn) {
			setNotifications([]);
			return;
		}
		refresh();
	}, [isLoggedIn, refresh]);

	const markAsRead = useCallback(
		(ids: string | string[]) => {
			const targetIds = Array.isArray(ids) ? ids : [ids];
			if (targetIds.length === 0) {
				return;
			}
			setReadIds((previous) => {
				const next = new Set(previous);
				targetIds.forEach((id) => next.add(id));
				persistReadIds(next);
				return next;
			});
		},
		[persistReadIds],
	);

	const markAllAsRead = useCallback(() => {
		if (notifications.length === 0) {
			return;
		}
		markAsRead(notifications.map((notification) => notification.id));
	}, [markAsRead, notifications]);

	const unreadNotifications = useMemo(
		() => notifications.filter((notification) => !readIds.has(notification.id)),
		[notifications, readIds],
	);

	const unreadCount = unreadNotifications.length;

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
