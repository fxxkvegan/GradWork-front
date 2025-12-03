import { useEffect, useState } from "react";
import { fetchCategories } from "../services/categoryApi";
import type { Category } from "../types/category";

interface CategoryState {
	categories: Category[];
	loading: boolean;
	error: string | null;
}

const initialState: CategoryState = {
	categories: [],
	loading: true,
	error: null,
};

export const useCategoriesList = () => {
	const [state, setState] = useState<CategoryState>(initialState);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			setState((prev) => ({ ...prev, loading: true, error: null }));
			try {
				const items = await fetchCategories();
				if (cancelled) {
					return;
				}

				const normalized = (items ?? []).map((item) => ({
					...item,
					image:
						typeof item.image === "string" && item.image.trim().length > 0
							? item.image
							: null,
				}));

				setState({ categories: normalized, loading: false, error: null });
			} catch (error) {
				if (cancelled) {
					return;
				}
				const message =
					error instanceof Error
						? error.message
						: "カテゴリの取得に失敗しました";
				setState({ categories: [], loading: false, error: message });
			}
		};

		load();

		return () => {
			cancelled = true;
		};
	}, []);

	return state;
};

export default useCategoriesList;
