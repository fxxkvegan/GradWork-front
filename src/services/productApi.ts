import axios from "axios";
import { API_CONFIG } from "../constants/api";
import type {
	Product,
	ProductCreateRequest,
	ProductUpdateRequest,
} from "../types/product";
import type {
	ReviewCreateRequest,
	ReviewListResponse,
	ReviewMutationResponse,
} from "../types/review";

export interface RankingCategory {
	id: number;
	name: string;
}

export interface RankingItemResponse {
	id: number;
	name: string;
	description?: string | null;
	rating?: number | null;
	download_count?: number | null;
	image_urls?: string[] | null;
	image_url?: string[] | string | null;
	category_ids?: Array<number | string> | null;
	categories?: RankingCategory[] | null;
	tags?: string[] | null;
	price?: number | null;
}

export interface RankingResponse {
	message?: string;
	items?: RankingItemResponse[];
	data?: RankingItemResponse[];
	count?: number;
	total?: number;
}

const client = axios.create({
	baseURL: API_CONFIG.BASE_URL,
	timeout: API_CONFIG.TIMEOUT,
});

const AUTH_TOKEN_KEY = "AUTH_TOKEN";
const normalizeReviewListResponse = (
	source: ReviewListResponse | undefined,
): ReviewListResponse => ({
	message: source?.message,
	data: Array.isArray(source?.data) ? source!.data : [],
	average_rating:
		typeof source?.average_rating === "number" ? source.average_rating : 0,
	review_count:
		typeof source?.review_count === "number" ? source.review_count : 0,
});

const normalizeReviewMutationResponse = (
	source: ReviewMutationResponse | undefined,
): ReviewMutationResponse => ({
	message: source?.message,
	data: source?.data,
	average_rating:
		typeof source?.average_rating === "number" ? source.average_rating : 0,
	review_count:
		typeof source?.review_count === "number" ? source.review_count : 0,
});

const authClient = axios.create({
	baseURL: API_CONFIG.BASE_URL,
	timeout: API_CONFIG.TIMEOUT,
});

authClient.interceptors.request.use((config) => {
	const token = localStorage.getItem(AUTH_TOKEN_KEY);
	if (token) {
		config.headers = config.headers ?? {};
		(config.headers as Record<string, string>).Authorization =
			`Bearer ${token}`;
	}
	return config;
});

export const fetchRankingProjects = async (): Promise<{
	items: RankingItemResponse[];
	message: string;
	count: number;
}> => {
	const { data } = await client.get<RankingResponse>("/rankings");

	const itemsSource = Array.isArray(data?.items)
		? data.items
		: Array.isArray(data?.data)
			? data.data
			: [];

	const items = itemsSource.filter((item): item is RankingItemResponse =>
		Boolean(item),
	);
	return {
		items,
		message: data?.message ?? "",
		count:
			typeof data?.count === "number"
				? data.count
				: typeof data?.total === "number"
					? data.total
					: items.length,
	};
};

const appendCategoryIds = (
	formData: FormData,
	categoryIds: ProductCreateRequest["categoryIds"],
) => {
	categoryIds?.forEach((id) => {
		formData.append("categoryIds[]", String(id));
	});
};

const appendImages = (
	formData: FormData,
	images: ProductCreateRequest["image_url"],
) => {
	images?.forEach((file) => {
		formData.append("image_url[]", file);
	});
};

const appendRemoveImageUrls = (
	formData: FormData,
	removeImageUrls: ProductUpdateRequest["remove_image_urls"],
) => {
	removeImageUrls?.forEach((url) => {
		formData.append("remove_image_urls[]", url);
	});
};

export const createProduct = async (
	payload: ProductCreateRequest,
): Promise<Product> => {
	const formData = new FormData();
	formData.append("name", payload.name);
	if (payload.description) {
		formData.append("description", payload.description);
	}
	appendCategoryIds(formData, payload.categoryIds);
	appendImages(formData, payload.image_url);

	const { data } = await authClient.post<Product>("/products", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	return data;
};

export const updateProduct = async (
	productId: number,
	payload: ProductUpdateRequest,
): Promise<Product> => {
	const formData = new FormData();
	formData.append("name", payload.name);
	if (payload.description) {
		formData.append("description", payload.description);
	}
	appendCategoryIds(formData, payload.categoryIds);
	appendImages(formData, payload.image_url);
	appendRemoveImageUrls(formData, payload.remove_image_urls);
	if (typeof payload.rating === "number") {
		formData.append("rating", String(payload.rating));
	}
	if (typeof payload.download_count === "number") {
		formData.append("download_count", String(payload.download_count));
	}

	const { data } = await authClient.post<Product>(
		`/products/${productId}`,
		formData,
		{
			headers: { "Content-Type": "multipart/form-data" },
			params: { _method: "PUT" },
		},
	);

	return data;
};

export const fetchMyProducts = async (): Promise<Product[]> => {
	const { data } = await authClient.get<{ items?: Product[] }>(
		"/users/me/products",
	);
	return Array.isArray(data?.items) ? data.items : [];
};

export const deleteProduct = async (productId: number): Promise<void> => {
	await authClient.delete(`/products/${productId}`);
};

export const fetchProductReviews = async (
	productId: number,
): Promise<ReviewListResponse> => {
	const { data } = await client.get<ReviewListResponse>(
		`/products/${productId}/reviews`,
	);
	return normalizeReviewListResponse(data);
};

export const createProductReview = async (
	productId: number,
	payload: ReviewCreateRequest,
): Promise<ReviewMutationResponse> => {
	const { data } = await authClient.post<ReviewMutationResponse>(
		`/products/${productId}/reviews`,
		payload,
	);
	return normalizeReviewMutationResponse(data);
};

export default {
	fetchRankingProjects,
	createProduct,
	updateProduct,
	fetchMyProducts,
	deleteProduct,
	fetchProductReviews,
	createProductReview,
};
