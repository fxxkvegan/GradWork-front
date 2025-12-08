export interface ApiResponse<T> {
	message: string;
	data?: T;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	currentPage: number;
	lastPage: number;
	perPage: number;
	nextPageUrl: string | null;
	prevPageUrl: string | null;
	message: string;
}
