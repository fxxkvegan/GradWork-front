import type { Category } from "./category";

export interface Product {
	id: number;
	name: string;
	description: string | null;
	rating: number;
	download_count: number;
	image_url: string | string[];
	categoryIds: string[];
	categories?: Category[];
	created_at: string;
	updated_at: string;
}

export interface ProductVersion {
	id: number;
	product_id: number;
	version: string;
	release_notes: string | null;
	release_at: string;
}

export interface ProductStatus {
	id: number;
	product_id: number;
	status: "online" | "maintenance" | "deprecated";
	message: string | null;
	created_at: string;
	updated_at: string;
}

export interface ProductCreateRequest {
	name: string;
	description?: string;
	categoryIds?: number[];
	image_url?: File[];
}

export interface ProductUpdateRequest {
	name: string;
	description?: string;
	categoryIds?: number[];
	image_url?: File[];
	rating?: number;
	download_count?: number;
	remove_image_urls?: string[];
}
