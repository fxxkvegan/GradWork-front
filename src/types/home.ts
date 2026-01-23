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
	tagline?: string | null;
	subtitle?: string;
	upvote_count?: number;
	has_upvoted?: boolean;
	upvotes_today_count?: number;
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
