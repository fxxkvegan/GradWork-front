import axios from "axios";
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

export const getProductFilesTree = async (
	productId: number,
): Promise<FileTreeResponse> => {
	const { data } = await client.get<FileTreeResponse>(
		`/products/${productId}/files/tree`,
	);
	return {
		files: Array.isArray(data?.files) ? data.files : [],
		total_files: data?.total_files,
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
