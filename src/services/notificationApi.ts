import axios from "axios";
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from "../constants/api";
import type {
	ReviewNotification,
	ReviewNotificationApiItem,
	ReviewNotificationListResponse,
} from "../types/notification";

const AUTH_TOKEN_KEY = "AUTH_TOKEN";

const client = axios.create({
	baseURL: API_CONFIG.BASE_URL,
	timeout: API_CONFIG.TIMEOUT,
});

client.interceptors.request.use((config) => {
	const token = localStorage.getItem(AUTH_TOKEN_KEY);
	if (token) {
		config.headers = config.headers ?? {};
		(config.headers as Record<string, string>).Authorization =
			`Bearer ${token}`;
	}
	return config;
});

const normalizeResponseItems = (
	items: ReviewNotificationApiItem[] | undefined,
): ReviewNotification[] => {
	if (!Array.isArray(items)) {
		return [];
	}

	return items.map((item) => ({
		id: String(item.id ?? item.review_id),
		productId: item.product_id,
		productName: item.product_name,
		productImage: item.product_image_url ?? null,
		reviewId: item.review_id,
		reviewerId: item.reviewer_id ?? null,
		reviewerName: item.reviewer_name,
		reviewerAvatar: item.reviewer_avatar_url ?? null,
		rating: item.rating,
		title: item.title,
		body: item.body,
		createdAt: item.created_at,
		isRead: Boolean(item.is_read),
		readAt: item.read_at ?? null,
	}));
};

export const fetchReviewNotifications = async (
	params: { limit?: number } = {},
): Promise<{
	items: ReviewNotification[];
	unreadCount: number;
	total: number;
}> => {
	try {
		const query: Record<string, number> = {};
		if (typeof params.limit === "number" && params.limit > 0) {
			query.limit = params.limit;
		}

		const { data } = await client.get<ReviewNotificationListResponse>(
			API_ENDPOINTS.NOTIFICATIONS.REVIEW_LIST,
			{ params: query },
		);

		const items = normalizeResponseItems(data?.data);
		const unreadCount =
			typeof data?.meta?.unread_count === "number"
				? data.meta.unread_count
				: items.filter((item) => !item.isRead).length;
		const total =
			typeof data?.meta?.total === "number" ? data.meta.total : items.length;

		return { items, unreadCount, total };
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.data) {
			const payload = error.response.data as { message?: string };
			throw new Error(
				payload?.message || ERROR_MESSAGES.NOTIFICATION.FETCH_FAILED,
			);
		}
		throw new Error(ERROR_MESSAGES.NETWORK.CONNECTION_ERROR);
	}
};

const normalizeIdsPayload = (ids: Array<string | number>): number[] =>
	ids
		.map((value) => Number(value))
		.filter((value) => Number.isInteger(value) && value > 0);

export const markReviewNotificationsRead = async (
	reviewIds: Array<string | number>,
): Promise<{ updated: number; unreadCount: number }> => {
	const normalizedIds = normalizeIdsPayload(reviewIds);
	if (normalizedIds.length === 0) {
		return { updated: 0, unreadCount: 0 };
	}

	try {
		const { data } = await client.post<{
			message?: string;
			data?: { updated?: number };
			meta?: { unread_count?: number };
		}>(API_ENDPOINTS.NOTIFICATIONS.REVIEW_MARK_READ, {
			reviewIds: normalizedIds,
		});

		return {
			updated: data?.data?.updated ?? normalizedIds.length,
			unreadCount:
				typeof data?.meta?.unread_count === "number"
					? data.meta.unread_count
					: 0,
		};
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.data) {
			const payload = error.response.data as { message?: string };
			throw new Error(
				payload?.message || ERROR_MESSAGES.NOTIFICATION.MARK_FAILED,
			);
		}
		throw new Error(ERROR_MESSAGES.NETWORK.CONNECTION_ERROR);
	}
};

export const markAllReviewNotificationsRead = async (): Promise<{
	updated: number;
	unreadCount: number;
}> => {
	try {
		const { data } = await client.post<{
			message?: string;
			data?: { updated?: number };
			meta?: { unread_count?: number };
		}>(API_ENDPOINTS.NOTIFICATIONS.REVIEW_MARK_ALL_READ);

		return {
			updated: data?.data?.updated ?? 0,
			unreadCount:
				typeof data?.meta?.unread_count === "number"
					? data.meta.unread_count
					: 0,
		};
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.data) {
			const payload = error.response.data as { message?: string };
			throw new Error(
				payload?.message || ERROR_MESSAGES.NOTIFICATION.MARK_FAILED,
			);
		}
		throw new Error(ERROR_MESSAGES.NETWORK.CONNECTION_ERROR);
	}
};

export default {
	fetchReviewNotifications,
	markReviewNotificationsRead,
	markAllReviewNotificationsRead,
};
