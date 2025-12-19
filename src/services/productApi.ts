import axios from "axios";
import { API_CONFIG } from "../constants/api";
import type {
	Product,
	ProductCreateRequest,
	ProductOwner,
	ProductUpdateRequest,
} from "../types/product";
import type {
	ReviewCreateRequest,
	ReviewListResponse,
	ReviewMutationResponse,
} from "../types/review";
import { getAuthToken } from "../utils/auth";

export interface RankingCategory {
	id: number;
	name: string;
}

export interface RankingItemResponse {
	id: number;
	name: string;
	description?: string | null;
	rating?: number | null;
	access_count?: number | null;
	google_play_url?: string | null;
	app_store_url?: string | null;
	web_app_url?: string | null;
	image_urls?: string[] | null;
	image_url?: string[] | string | null;
	category_ids?: Array<number | string> | null;
	categories?: RankingCategory[] | null;
	tags?: string[] | null;
	price?: number | null;
	owner?: ProductOwner | null;
}

export interface RankingResponse {
	message?: string;
	items?: RankingItemResponse[];
	data?: RankingItemResponse[];
	count?: number;
	total?: number;
}

export interface ProductListResponse {
	message?: string;
	items?: Product[];
	total?: number;
	currentPage?: number;
	lastPage?: number;
	perPage?: number;
	nextPageUrl?: string | null;
	prevPageUrl?: string | null;
}

export interface FetchProductsParams {
	page?: number;
	limit?: number;
	q?: string;
	sort?: "name" | "rating" | "access_count" | "created_at";
	categoryIds?: number[];
}

export interface FetchProductsResult {
	items: Product[];
	pagination: {
		total: number;
		currentPage: number;
		lastPage: number;
		perPage: number;
		nextPageUrl: string | null;
		prevPageUrl: string | null;
		message: string;
	};
}

const client = axios.create({
	baseURL: API_CONFIG.BASE_URL,
	timeout: API_CONFIG.TIMEOUT,
});

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
	const token = getAuthToken();
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

const normalizeProductItems = (items: Product[] | undefined): Product[] => {
	if (!Array.isArray(items)) {
		return [];
	}

	return items.map((item) => {
		if (Array.isArray(item.image_url)) {
			return item;
		}

		if (typeof item.image_url === "string" && item.image_url !== "") {
			return item;
		}

		return {
			...item,
			image_url: [],
		};
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
	if (payload.google_play_url) {
		formData.append("google_play_url", payload.google_play_url);
	}
	if (payload.app_store_url) {
		formData.append("app_store_url", payload.app_store_url);
	}
	if (payload.web_app_url) {
		formData.append("web_app_url", payload.web_app_url);
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
	if (payload.google_play_url !== undefined) {
		formData.append("google_play_url", payload.google_play_url ?? "");
	}
	if (payload.app_store_url !== undefined) {
		formData.append("app_store_url", payload.app_store_url ?? "");
	}
	if (payload.web_app_url !== undefined) {
		formData.append("web_app_url", payload.web_app_url ?? "");
	}
	appendCategoryIds(formData, payload.categoryIds);
	appendImages(formData, payload.image_url);
	appendRemoveImageUrls(formData, payload.remove_image_urls);
	if (typeof payload.rating === "number") {
		formData.append("rating", String(payload.rating));
	}
	if (typeof payload.access_count === "number") {
		formData.append("access_count", String(payload.access_count));
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

export const fetchProducts = async (
	params: FetchProductsParams = {},
): Promise<FetchProductsResult> => {
	const queryParams: Record<string, string | number | string[] | undefined> = {
		page: typeof params.page === "number" ? params.page : undefined,
		limit: typeof params.limit === "number" ? params.limit : undefined,
		q: params.q,
		sort: params.sort,
		categoryIds:
			Array.isArray(params.categoryIds) && params.categoryIds.length > 0
				? params.categoryIds.map((id) => String(id))
				: undefined,
	};

	const { data } = await client.get<ProductListResponse>("/products", {
		params: queryParams,
	});

	const items = normalizeProductItems(data?.items);
	const total = typeof data?.total === "number" ? data.total : items.length;
	const currentPage =
		typeof data?.currentPage === "number" && data.currentPage > 0
			? data.currentPage
			: 1;
	const lastPage =
		typeof data?.lastPage === "number" && data.lastPage > 0 ? data.lastPage : 1;
	const perPage =
		typeof data?.perPage === "number" && data.perPage > 0
			? data.perPage
			: (params.limit ?? items.length);

	return {
		items,
		pagination: {
			total,
			currentPage,
			lastPage,
			perPage,
			nextPageUrl: data?.nextPageUrl ?? null,
			prevPageUrl: data?.prevPageUrl ?? null,
			message: data?.message ?? "",
		},
	};
};

export interface IncrementAccessCountResponse {
	message: string;
	access_count: number;
}

export const incrementAccessCount = async (
	productId: number,
): Promise<IncrementAccessCountResponse> => {
	const { data } = await client.post<IncrementAccessCountResponse>(
		`/products/${productId}/access`,
	);
	return data;
};

export default {
	fetchRankingProjects,
	createProduct,
	updateProduct,
	fetchMyProducts,
	deleteProduct,
	fetchProductReviews,
	createProductReview,
	fetchProducts,
	incrementAccessCount,
};
