export interface Category {
	id: number;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

export interface CategoryResponse {
	items: Category[];
	total: number;
}

export interface CategoryCreateRequest {
	name: string;
	description?: string;
}
