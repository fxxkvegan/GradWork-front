import axios from "axios";
import { getAuthToken } from "../utils/auth";
import { API_CONFIG } from "./config";

export type ProductFileItem = {
	path: string;
	type: "file" | "dir";
	size: number | null;
	is_previewable: boolean;
};

export type FileTreeResponse = {
	files: ProductFileItem[];
	total_files?: number;
	total_size?: number;
};

export type FilePreviewResponse = {
	path: string;
	content: string;
	truncated: boolean;
};

const client = axios.create({
	baseURL: API_CONFIG.BASE_URL,
	timeout: API_CONFIG.TIMEOUT,
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

export const getProductFilesTree = async (
	productId: number,
): Promise<FileTreeResponse> => {
	const { data } = await client.get<
		FileTreeResponse & {
			items?: ProductFileItem[];
			count?: number;
		}
	>(`/products/${productId}/files/tree`);

	const files = Array.isArray(data?.files)
		? data.files
		: Array.isArray(data?.items)
			? data.items
			: [];

	return {
		files,
		total_files:
			typeof data?.total_files === "number"
				? data.total_files
				: typeof data?.count === "number"
					? data.count
					: undefined,
		total_size: data?.total_size,
	};
};

export const getProductFilePreview = async (
	productId: number,
	path: string,
): Promise<FilePreviewResponse> => {
	const { data } = await client.get<FilePreviewResponse>(
		`/products/${productId}/files/preview?path=${encodeURIComponent(path)}`,
	);
	return data;
};

export const postProductFileDownloadIntent = async (
	productId: number,
	path: string,
): Promise<{ ok?: boolean }> => {
	const { data } = await client.post<{ ok?: boolean }>(
		`/products/${productId}/files/download-intent`,
		{ path },
	);
	return data ?? {};
};

export const postProductReadme = async (
	productId: number,
	content: string,
): Promise<{ ok?: boolean; path?: string }> => {
	const { data } = await authClient.post<{ ok?: boolean; path?: string }>(
		`/products/${productId}/files/readme`,
		{ content },
	);
	return data ?? {};
};
