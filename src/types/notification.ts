export interface ReviewNotificationApiItem {
	id: number;
	review_id: number;
	product_id: number;
	product_name: string;
	product_image_url?: string | null;
	reviewer_id: number | null;
	reviewer_name: string;
	reviewer_avatar_url?: string | null;
	rating: number;
	title: string;
	body: string;
	created_at: string;
	is_read: boolean;
	read_at?: string | null;
}

export interface ReviewNotificationListResponse {
	message?: string;
	data: ReviewNotificationApiItem[];
	meta?: {
		total?: number;
		unread_count?: number;
	};
}

export interface ReviewNotification {
	id: string;
	productId: number;
	productName: string;
	productImage?: string | null;
	reviewId: number;
	reviewerId?: number | null;
	reviewerName: string;
	reviewerAvatar?: string | null;
	rating: number;
	title: string;
	body: string;
	createdAt: string;
	isRead: boolean;
	readAt: string | null;
}
