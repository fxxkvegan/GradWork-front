import type { Product } from "./product";

export interface HomeProjectOwner {
	id: number;
	name: string;
	displayName?: string | null;
	avatarUrl?: string | null;
}

export interface HomeProject {
	id: number;
	title: string;
	subtitle: string;
	img: string;
	category: string;
	rating: number;
	downloads: number;
	tags: string[];
	owner?: HomeProjectOwner | null;
}

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
