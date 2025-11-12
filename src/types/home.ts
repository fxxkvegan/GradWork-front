import type { Product } from "./product";

export interface HomeData {
	topRanked: {
		items: Product[];
		total: number;
	};
	trending: {
		items: Product[];
		total: number;
	};
}

export interface HomeResponse {
	message: string;
	data: HomeData;
}
