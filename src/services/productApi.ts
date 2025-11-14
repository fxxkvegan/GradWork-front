import axios from "axios";
import { API_CONFIG } from "../constants/api";

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

export default {
	fetchRankingProjects,
};
