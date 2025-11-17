import {
	Code as CodeIcon,
	Favorite as FavoriteIcon,
	Star as StarIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CardMedia,
	Chip,
	CircularProgress,
	Container,
	IconButton,
	Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import { API_CONFIG } from "../constants/api";
import * as favorites from "../utils/favorites";

import "./HomePage.css";
import "./carousel-extra.css";
import "./category.css";

import { useNavigate } from "react-router-dom";
import {
	fetchRankingProjects,
	type RankingItemResponse,
} from "../services/productApi";

/* ---------- 型定義 ---------- */
export interface Project {
	id: number;
	title: string;
	subtitle: string;
	img: string;
	category: string;
	rating: number;
	downloads: number;
	tags: string[];
}
export interface Category {
	name: string;
	icon: ReactNode;
	count: number;
}

/* ---------- 汎用フェッチフック ---------- */
const useApiData = <T,>(endpoint: string, fallback: T) => {
	const [data, setData] = useState<T>(fallback);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json = await res.json();
				if (!cancelled) setData(json);
			} catch (e: unknown) {
				console.warn(`${endpoint} failed, using fallback`, e);
				if (!cancelled)
					setError(e instanceof Error ? e.message : "Unknown error");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [endpoint]);

	return { data, loading, error };
};

/* ---------- プロジェクトカード ---------- */
const ProjectCard: React.FC<{
	project: Project;
	onView?: (id: number) => void;
}> = ({ project, onView }) => {
	// お気に入り状態の管理
	const [isFavorite, setIsFavorite] = useState(() =>
		favorites.isFavorite(project.id),
	);

	// お気に入りトグル処理
	const handleFavoriteClick = (event: React.MouseEvent) => {
		event.preventDefault();
		const newState = favorites.toggleFavorite(project.id);
		setIsFavorite(newState);
	};

	const handleViewClick = (event: React.MouseEvent) => {
		event.preventDefault();
		onView?.(project.id);
	};

	return (
		<Card className="project-card">
			<Box className="card-image-container">
				<CardMedia component="img" image={project.img} alt={project.title} />
				<Box className="card-overlay">
					<Chip
						label={project.category}
						size="small"
						className="category-chip"
					/>
				</Box>{" "}
				<IconButton
					size="small"
					className="favorite-button"
					onClick={handleFavoriteClick}
					sx={{
						opacity: 1,
						backgroundColor: "rgba(255, 255, 255, 0.9) !important",
						"&:hover": {
							backgroundColor: "white !important",
						},
						"& svg": {
							stroke: isFavorite ? "#e91e63" : "#757575",
							strokeWidth: 1.5,
							fill: isFavorite ? "#e91e63" : "transparent",
						},
						"&:hover svg": {
							stroke: "#e91e63",
						},
					}}
				>
					<FavoriteIcon fontSize="small" />
				</IconButton>
			</Box>

			<CardContent className="card-content">
				<Box className="card-header">
					<Typography variant="subtitle2">{project.downloads} DL</Typography>
					<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
						<StarIcon fontSize="small" />
						<Typography variant="subtitle2">{project.rating}</Typography>
					</Box>
				</Box>

				<Typography variant="subtitle1" fontWeight="bold">
					{project.title}
				</Typography>
				<Typography variant="body2" className="project-description">
					{project.subtitle}
				</Typography>

				<Box className="tags-container">
					{project.tags.map((t) => (
						<Chip
							key={t}
							label={t}
							size="small"
							variant="outlined"
							className="tag-chip"
						/>
					))}
				</Box>

				<Box className="card-footer">
					<Typography variant="subtitle2" className="downloads-text">
						{project.downloads.toLocaleString()} DL
					</Typography>
					<Button
						size="small"
						variant="contained"
						disableElevation
						className="view-button"
						onClick={handleViewClick}
					>
						詳細を見る
					</Button>
				</Box>
			</CardContent>
		</Card>
	);
};

/* ---------- HomePage ---------- */
const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const dummyCategories: Category[] = [
		{ name: "Web開発", icon: <CodeIcon />, count: 28 },
		{
			name: "AI",
			icon: (
				<img
					src="https://img.icons8.com/ios/50/artificial-intelligence.png"
					alt="AI"
					width="24"
					height="24"
				/>
			),
			count: 15,
		},
		{
			name: "デザイン",
			icon: (
				<img
					src="https://img.icons8.com/ios/50/design--v1.png"
					alt="デザイン"
					width="24"
					height="24"
				/>
			),
			count: 22,
		},
		{
			name: "データ",
			icon: (
				<img
					src="https://img.icons8.com/ios/50/database.png"
					alt="データ"
					width="24"
					height="24"
				/>
			),
			count: 18,
		},
		{
			name: "バックエンド",
			icon: (
				<img
					src="https://img.icons8.com/ios/50/server.png"
					alt="バックエンド"
					width="24"
					height="24"
				/>
			),
			count: 20,
		},
		{
			name: "ビジネス",
			icon: (
				<img
					src="https://img.icons8.com/ios/50/business.png"
					alt="ビジネス"
					width="24"
					height="24"
				/>
			),
			count: 14,
		},
		{
			name: "マーケティング",
			icon: (
				<img
					src="https://img.icons8.com/ios/50/commercial.png"
					alt="マーケティング"
					width="24"
					height="24"
				/>
			),
			count: 17,
		},
		{
			name: "ゲーム",
			icon: (
				<img
					src="https://img.icons8.com/ios/50/controller.png"
					alt="ゲーム"
					width="24"
					height="24"
				/>
			),
			count: 12,
		},
		{
			name: "AR/VR",
			icon: (
				<img
					src="https://img.icons8.com/ios/50/virtual-reality.png"
					alt="AR/VR"
					width="24"
					height="24"
				/>
			),
			count: 8,
		},
		{
			name: "IoT",
			icon: (
				<img
					src="https://img.icons8.com/ios/50/iot-sensor.png"
					alt="IoT"
					width="24"
					height="24"
				/>
			),
			count: 11,
		},
		{
			name: "ブロックチェーン",
			icon: (
				<img
					src="https://img.icons8.com/ios/50/blockchain-technology.png"
					alt="ブロックチェーン"
					width="24"
					height="24"
				/>
			),
			count: 9,
		},
		{
			name: "セキュリティ",
			icon: (
				<img
					src="https://img.icons8.com/ios/50/shield.png"
					alt="セキュリティ"
					width="24"
					height="24"
				/>
			),
			count: 13,
		},
	];

	/* API 取得 - 先に取得しておくことで初期化前アクセスエラーを防ぐ */
	const { data: categories } = useApiData<Category[]>(
		"/categories",
		dummyCategories,
	);

	const carouselRef = useRef<HTMLDivElement | null>(null);
	const [rankingProjects, setRankingProjects] = useState<Project[]>([]);
	const [rankingLoading, setRankingLoading] = useState(true);
	const [rankingError, setRankingError] = useState<string | null>(null);
	const [rankingEmptyMessage, setRankingEmptyMessage] = useState<string | null>(
		null,
	);
	const [isCarouselPaused, setIsCarouselPaused] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const handleViewProject = useCallback(
		(projectId: number) => {
			navigate(`/item/${projectId}`);
		},
		[navigate],
	);

	useEffect(() => {
		let cancelled = false;

		const parseImageField = (value: unknown): string[] => {
			if (Array.isArray(value)) {
				return value.filter(
					(item): item is string =>
						typeof item === "string" && item.trim() !== "",
				);
			}
			if (typeof value === "string") {
				try {
					const parsed = JSON.parse(value);
					if (Array.isArray(parsed)) {
						return parsed.filter(
							(item): item is string =>
								typeof item === "string" && item.trim() !== "",
						);
					}
					if (typeof parsed === "string" && parsed.trim() !== "") {
						return [parsed];
					}
				} catch {
					return value.trim() !== "" ? [value] : [];
				}
			}
			return [];
		};

		const toProject = (item: RankingItemResponse): Project => {
			const rawImages = item?.image_urls ?? item?.image_url;
			const imageUrls = parseImageField(rawImages ?? []);
			const categoryNames = Array.isArray(item?.categories)
				? item.categories
						.map((category) =>
							typeof category?.name === "string" && category.name.trim() !== ""
								? category.name
								: null,
						)
						.filter((name): name is string => Boolean(name))
				: [];
			const explicitTags = Array.isArray(item?.tags)
				? item.tags.filter(
						(tag): tag is string =>
							typeof tag === "string" && tag.trim() !== "",
					)
				: [];
			const tags = Array.from(
				new Set([...categoryNames, ...explicitTags]),
			).slice(0, 6);
			const firstCategory = categoryNames[0] ?? "カテゴリー";

			return {
				id: Number(item?.id) || 0,
				title: item?.name ?? "無題",
				subtitle: item?.description ?? "",
				img: imageUrls[0] ?? "/no-image.png",
				category: firstCategory,
				rating:
					typeof item?.rating === "number"
						? item.rating
						: Number((item?.rating as unknown) ?? 0) || 0,
				downloads:
					typeof item?.download_count === "number"
						? item.download_count
						: Number((item?.download_count as unknown) ?? 0) || 0,
				tags: tags.length ? tags : [firstCategory],
			};
		};

		const fetchRankings = async () => {
			setRankingLoading(true);
			setRankingError(null);
			try {
				const { items, message } = await fetchRankingProjects();
				const projects = items
					.map(toProject)
					.filter((project) => project.id !== 0 && project.img !== "");

				if (!cancelled) {
					setRankingProjects(projects);
					if (projects.length) {
						setRankingError(null);
						setRankingEmptyMessage(null);
					} else {
						setRankingError(null);
						setRankingEmptyMessage(
							message || "現在、表示できるランキングがありません。",
						);
					}
				}
			} catch (error) {
				console.error("ランキング取得失敗:", error);
				if (!cancelled) {
					const message =
						error instanceof Error
							? error.message
							: "ランキングの取得に失敗しました";
					setRankingError(message);
					setRankingEmptyMessage(null);
					setRankingProjects([]);
				}
			} finally {
				if (!cancelled) {
					setRankingLoading(false);
				}
			}
		};

		fetchRankings();

		return () => {
			cancelled = true;
		};
	}, []);

	const repeatedProjects = useMemo(() => {
		if (!rankingProjects.length) return [];
		return [...rankingProjects, ...rankingProjects, ...rankingProjects];
	}, [rankingProjects]);

	useEffect(() => {
		setActiveIndex(0);
	}, [rankingProjects.length]);

	useEffect(() => {
		const track = carouselRef.current;
		if (!track || !rankingProjects.length) return;

		const baseWidth = track.scrollWidth / 3;
		if (Number.isFinite(baseWidth) && baseWidth > 0) {
			track.scrollLeft = baseWidth;
		}
	}, [rankingProjects.length, repeatedProjects.length]);

	useEffect(() => {
		const track = carouselRef.current;
		if (!track || !rankingProjects.length) return;

		const intervalId = window.setInterval(() => {
			if (isCarouselPaused) return;
			const setWidth = track.scrollWidth / 3 || 1;
			if (track.scrollLeft >= setWidth * 2) {
				track.scrollLeft -= setWidth;
			}
			if (track.scrollLeft <= setWidth * 0.5) {
				track.scrollLeft += setWidth;
			}
			track.scrollLeft += 0.7;
		}, 16);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [rankingProjects.length, isCarouselPaused]);

	useEffect(() => {
		const track = carouselRef.current;
		if (!track || !rankingProjects.length) return;

		const handleScroll = () => {
			const children = Array.from(track.children);
			if (!children.length) return;
			const { left, width } = track.getBoundingClientRect();
			const centerX = left + width / 2;
			let closestIndex = 0;
			let closestDistance = Number.POSITIVE_INFINITY;
			children.forEach((child, index) => {
				const rect = child.getBoundingClientRect();
				const childCenter = rect.left + rect.width / 2;
				const distance = Math.abs(childCenter - centerX);
				if (distance < closestDistance) {
					closestDistance = distance;
					closestIndex = index % rankingProjects.length;
				}
			});
			setActiveIndex(closestIndex);
		};

		track.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => {
			track.removeEventListener("scroll", handleScroll);
		};
	}, [rankingProjects.length]);
	return (
		<div className="homepage">
			<AppHeaderWithAuth activePath="/" />
			{/* ヒーロー */}
			<Box className="hero-section">
				<Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 5 }}>
					<Box className="hero-content">
						<Typography variant="h2" className="hero-title">
							開発ちゅ♡
						</Typography>
					</Box>
				</Container>
			</Box>{" "}
			{/* 注目のプロジェクト */}
			<Container
				maxWidth="lg"
				className="featured-section"
				sx={{ px: { xs: 2, sm: 3, md: 4 } }}
			>
				<Typography variant="h4" className="section-title">
					注目のプロジェクト
				</Typography>{" "}
				{rankingLoading ? (
					<Box className="loading-container">
						<CircularProgress />
					</Box>
				) : rankingProjects.length === 0 ? (
					<Alert
						severity={rankingError ? "error" : "info"}
						className="api-error-alert"
					>
						{rankingError ??
							rankingEmptyMessage ??
							"現在、表示できるプロジェクトがありません。"}
					</Alert>
				) : (
					<>
						<Box
							className="carousel-section"
							id="projectCarousel"
							sx={{ mt: 5, mb: 5 }}
						>
							<Box className="carousel-container">
								<Box
									className={`carousel-track ${isCarouselPaused ? "paused" : ""}`}
									ref={carouselRef}
									onMouseEnter={() => setIsCarouselPaused(true)}
									onMouseLeave={() => setIsCarouselPaused(false)}
									onMouseDown={() => setIsCarouselPaused(true)}
									onMouseUp={() => setIsCarouselPaused(false)}
									onTouchStart={() => setIsCarouselPaused(true)}
									onTouchEnd={() => setIsCarouselPaused(false)}
								>
									{repeatedProjects.map((project, index) => (
										<Box
											key={`${project.id}-${index}`}
											className={`carousel-item ${rankingProjects.length && index % rankingProjects.length === activeIndex ? "active" : ""}`}
											data-index={
												rankingProjects.length
													? index % rankingProjects.length
													: 0
											}
										>
											<ProjectCard
												project={project}
												onView={handleViewProject}
											/>
										</Box>
									))}
								</Box>
							</Box>
						</Box>
					</>
				)}
			</Container>
			{/* カテゴリ */}
			<Box className="category-section">
				<Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
					<Typography variant="h4" className="section-title">
						カテゴリから探す
					</Typography>
					<Box className="category-carousel" sx={{ mt: 4 }}>
						{Array.isArray(categories) &&
							categories.map((c) => (
								<Box key={c.name} className="carousel-item category-item">
									<Button
										variant="contained"
										className="category-content"
										fullWidth
										sx={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											gap: "8px",
											height: "100%",
											p: 2,
											borderRadius: 2,
											textTransform: "none",
											backgroundColor: "white",
											color: "text.primary",
										}}
										onClick={() =>
											navigate(
												`/projects?category=${encodeURIComponent(c.name)}`,
											)
										}
									>
										<Box className="category-icon-wrapper">{c.icon}</Box>
										<Typography variant="subtitle1" className="category-name">
											{c.name}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
											className="category-count"
										>
											{c.count}件
										</Typography>
									</Button>
								</Box>
							))}
					</Box>
				</Container>
			</Box>
		</div>
	);
};

export default HomePage;
