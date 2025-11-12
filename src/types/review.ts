import type { ApiResponse } from "./api";

export interface Review {
	id: number;
	product_id: number;
	author_id: number;
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

export interface ReviewListResponse extends ApiResponse<Review[]> {}

export interface ReviewResponseListResponse
	extends ApiResponse<ReviewResponse[]> {}

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
