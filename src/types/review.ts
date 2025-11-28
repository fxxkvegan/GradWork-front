export interface Review {
	id: number;
	product_id: number;
	author_id: number | null;
	author_name?: string | null;
	author_avatar_url?: string | null;
	title: string;
	body: string;
	rating: number;
	helpful_count: number;
	created_at: string;
	updated_at: string;
}

export interface ReviewResponse {
	id: number;
	review_id: number;
	author_id: number;
	body: string;
	created_at: string;
	updated_at: string;
}

export interface ReviewListResponse {
	message?: string;
	data: Review[];
	average_rating: number;
	review_count: number;
}

export interface ReviewMutationResponse {
	message?: string;
	data?: Review;
	average_rating: number;
	review_count: number;
}

export interface ReviewResponseListResponse {
	message?: string;
	data: ReviewResponse[];
}

export interface ReviewCreateRequest {
	title: string;
	body: string;
	rating: number;
}

export interface ReviewUpdateRequest {
	title: string;
	body: string;
	rating: number;
}

export interface ReviewResponseCreateRequest {
	body: string;
}
