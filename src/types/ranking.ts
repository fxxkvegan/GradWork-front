import type { Product } from "./product";

export interface RankingResponse {
	message: string;
	items: Product[];
}
