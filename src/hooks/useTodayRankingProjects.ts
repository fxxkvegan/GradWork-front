import { useEffect, useState } from "react";
import { fetchTodayRankingProjects } from "../services/productApi";
import type { HomeProject } from "../types/home";
import { mapRankingItemToProject } from "../utils/projectMapper";

interface RankingState {
	projects: HomeProject[];
	loading: boolean;
	error: string | null;
	emptyMessage: string | null;
}

const initialState: RankingState = {
	projects: [],
	loading: true,
	error: null,
	emptyMessage: null,
};

export const useTodayRankingProjects = () => {
	const [state, setState] = useState<RankingState>(initialState);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			setState((prev) => ({ ...prev, loading: true, error: null }));
			try {
				const { items, message } = await fetchTodayRankingProjects();
				const projects = items
					.map(mapRankingItemToProject)
					.filter((project) => project.id !== 0 && project.img.trim() !== "");

				if (!cancelled) {
					setState({
						projects,
						loading: false,
						error: null,
						emptyMessage:
							projects.length === 0
								? message || "現在、表示できるランキングがありません。"
								: null,
					});
				}
			} catch (error) {
				if (cancelled) {
					return;
				}
				const message =
					error instanceof Error
						? error.message
						: "ランキングの取得に失敗しました";
				setState({
					projects: [],
					loading: false,
					error: message,
					emptyMessage: null,
				});
			}
		};

		load();

		return () => {
			cancelled = true;
		};
	}, []);

	return state;
};

export default useTodayRankingProjects;
