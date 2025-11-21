import type { Category } from "./category";

export interface ProductOwner {
	id: number;
	name: string;
	displayName?: string | null;
	avatarUrl?: string | null;
	headerUrl?: string | null;
	bio?: string | null;
	location?: string | null;
	website?: string | null;
}

export interface Product {
	id: number;
	name: string;
	description: string | null;
	rating: number;
	download_count: number;
	image_url: string | string[] | null;
	categoryIds: string[];
	categories?: Category[];
	owner?: ProductOwner | null;
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
