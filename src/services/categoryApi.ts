import axios from "axios";
import { API_CONFIG } from "../constants/api";
import type {
	Category,
	CategoryListResponse,
	CreateCategoryRequest,
	UpdateCategoryRequest,
} from "../types/category";

/**
 * カテゴリ一覧を取得
 */
export const fetchCategories = async (): Promise<Category[]> => {
	const response = await axios.get<CategoryListResponse>(
		`${API_CONFIG.BASE_URL}/api/categories`,
	);
	return response.data.items;
};

/**
 * カテゴリ詳細を取得
 */
export const fetchCategory = async (id: number): Promise<Category> => {
	const response = await axios.get<Category>(
		`${API_CONFIG.BASE_URL}/api/categories/${id}`,
	);
	return response.data;
};

/**
 * カテゴリを作成
 */
export const createCategory = async (
	data: CreateCategoryRequest,
): Promise<Category> => {
	const formData = new FormData();
	formData.append("name", data.name);
	if (data.image) {
		formData.append("image", data.image);
	}

	const response = await axios.post<Category>(
		`${API_CONFIG.BASE_URL}/api/categories`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);
	return response.data;
};

/**
 * カテゴリを更新
 */
export const updateCategory = async (
	id: number,
	data: UpdateCategoryRequest,
): Promise<Category> => {
	const formData = new FormData();
	if (data.name) {
		formData.append("name", data.name);
	}
	if (data.image) {
		formData.append("image", data.image);
	}
	formData.append("_method", "PUT"); // Laravel の FormData での PUT リクエスト

	const response = await axios.post<Category>(
		`${API_CONFIG.BASE_URL}/api/categories/${id}`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);
	return response.data;
};

/**
 * カテゴリを削除
 */
export const deleteCategory = async (id: number): Promise<void> => {
	await axios.delete(`${API_CONFIG.BASE_URL}/api/categories/${id}`);
};

export default {
	fetchCategories,
	fetchCategory,
	createCategory,
	updateCategory,
	deleteCategory,
};
