export interface ReviewNotification {
	id: string;
	productId: number;
	productName: string;
	productImage?: string | null;
	reviewId: number;
	reviewerName: string;
	reviewerAvatar?: string | null;
	rating: number;
	title: string;
	body: string;
	createdAt: string;
}
