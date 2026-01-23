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
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import ProductTagline from "../components/ProductTagline";
import UpvoteButton from "../components/UpvoteButton";
import UserAvatarButton from "../components/UserAvatarButton";
import { useCategoriesList } from "../hooks/useCategoriesList";
import { useTodayRankingProjects } from "../hooks/useTodayRankingProjects";
import { fetchProducts } from "../services/productApi";
import * as favorites from "../utils/favorites";

import "./HomePage.css";
import "./carousel-extra.css";
import "./category.css";

import { useNavigate } from "react-router-dom";
import type { HomeProject } from "../types/home";
import type { Product } from "../types/product";

/* ---------- プロジェクトカード ---------- */
const ProjectCard: React.FC<{
	project: HomeProject;
	onView?: (id: number) => void;
	onUpvoteChange?: (nextCount: number, nextHasUpvoted: boolean) => void;
	showTodayMeta?: boolean;
}> = ({ project, onView, onUpvoteChange, showTodayMeta = false }) => {
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

	const ownerName =
		project.owner?.displayName?.trim() || project.owner?.name?.trim() || "";
	const upvoteCount =
		typeof project.upvote_count === "number" ? project.upvote_count : 0;
	const todayCount =
		typeof project.upvotes_today_count === "number"
			? project.upvotes_today_count
			: 0;
	const accessCount =
		typeof project.downloads === "number" ? project.downloads : 0;
	const shouldShowToday = showTodayMeta && todayCount > 0;

	return (
		<Card className="project-card">
			<Box className="card-image-container">
				<CardMedia
					component="img"
					image={project.img}
					alt={project.title}
					loading="lazy"
					className="card-image"
					sx={{
						height: { xs: 220, sm: 260, md: 280 },
						width: "100%",
						objectFit: "cover",
						objectPosition: "center",
					}}
				/>
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
				{project.owner && (
					<Box
						sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}
					>
						<UserAvatarButton
							userId={project.owner.id}
							name={project.owner.name}
							displayName={project.owner.displayName ?? project.owner.name}
							avatarUrl={project.owner.avatarUrl ?? null}
							size={32}
						/>
						<Typography variant="body2" fontWeight="medium">
							{ownerName || project.owner?.name || "投稿者"}
						</Typography>
					</Box>
				)}
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
				<ProductTagline
					tagline={project.tagline}
					lines={2}
					className="project-description"
				/>
				{showTodayMeta && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1.5,
							mt: 1,
							color: "text.secondary",
						}}
					>
						<Typography variant="caption">▲ {upvoteCount}</Typography>
						{shouldShowToday && (
							<Typography variant="caption">今日 +{todayCount}</Typography>
						)}
						<Typography variant="caption">閲覧 {accessCount}</Typography>
					</Box>
				)}

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
					<UpvoteButton
						productId={project.id}
						count={project.upvote_count ?? 0}
						hasUpvoted={project.has_upvoted ?? false}
						onChange={onUpvoteChange}
					/>
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
	const carouselRef = useRef<HTMLDivElement | null>(null);
	const {
		projects: todayProjects,
		loading: todayLoading,
		error: todayError,
		emptyMessage: todayEmptyMessage,
	} = useTodayRankingProjects();
	const {
		categories,
		loading: categoryLoading,
		error: categoryError,
	} = useCategoriesList();
	const [isCarouselPaused, setIsCarouselPaused] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [activeTab, setActiveTab] = useState<"today" | "new">("today");
	const [todayItems, setTodayItems] = useState<HomeProject[]>([]);
	const [newItems, setNewItems] = useState<HomeProject[]>([]);
	const [newLoading, setNewLoading] = useState(false);
	const [newError, setNewError] = useState<string | null>(null);
	const handleViewProject = useCallback(
		(projectId: number) => {
			navigate(`/item/${projectId}`);
		},
		[navigate],
	);

	const displayedItems = activeTab === "today" ? todayItems : newItems;
	const repeatedItems = useMemo(() => {
		if (activeTab !== "today") return displayedItems;
		if (!displayedItems.length) return [];
		return [...displayedItems, ...displayedItems, ...displayedItems];
	}, [activeTab, displayedItems]);

	useEffect(() => {
		setTodayItems(todayProjects);
	}, [todayProjects]);

	useEffect(() => {
		let mounted = true;
		const loadNewProjects = async () => {
			setNewLoading(true);
			setNewError(null);
			try {
				const { items } = await fetchProducts({
					limit: 12,
				});
				if (!mounted) return;
				const sortedItems = [...items].sort((a, b) => {
					const toTime = (value?: string | null) =>
						value ? new Date(value).getTime() : 0;
					const timeA = Math.max(toTime(a.created_at), toTime(a.updated_at));
					const timeB = Math.max(toTime(b.created_at), toTime(b.updated_at));
					return timeB - timeA;
				});
				const mapped = sortedItems.map((product: Product) => {
					const images = Array.isArray(product.image_url)
						? product.image_url
						: typeof product.image_url === "string" && product.image_url
							? [product.image_url]
							: [];
					const categoryName = product.categories?.[0]?.name ?? "カテゴリー";
					const tags = product.categories
						? product.categories.map((c) => c.name).filter(Boolean)
						: [];
					return {
						id: product.id,
						title: product.name,
						tagline: product.tagline,
						img: images[0] ?? "/nice_dig.png",
						category: categoryName,
						rating: product.rating ?? 0,
						downloads: product.access_count ?? 0,
						tags: tags.length ? tags : [categoryName],
						owner: product.owner ?? null,
						upvote_count: product.upvote_count ?? 0,
						has_upvoted: product.has_upvoted ?? false,
					};
				});
				setNewItems(mapped);
			} catch (error) {
				if (!mounted) return;
				setNewError(
					error instanceof Error
						? error.message
						: "新着プロジェクトの取得に失敗しました",
				);
				setNewItems([]);
			} finally {
				if (mounted) {
					setNewLoading(false);
				}
			}
		};
		loadNewProjects();
		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		setActiveIndex(0);
	}, [displayedItems.length, activeTab]);

	useEffect(() => {
		const track = carouselRef.current;
		if (!track || !displayedItems.length || activeTab !== "today") return;

		const baseWidth = track.scrollWidth / 3;
		if (Number.isFinite(baseWidth) && baseWidth > 0) {
			track.scrollLeft = baseWidth;
		}
	}, [displayedItems.length, repeatedItems.length, activeTab]);

	useEffect(() => {
		const track = carouselRef.current;
		if (!track || !displayedItems.length || activeTab !== "today") return;

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
	}, [displayedItems.length, isCarouselPaused, activeTab]);

	useEffect(() => {
		const track = carouselRef.current;
		if (!track || !displayedItems.length) return;

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
					closestIndex = displayedItems.length
						? index % displayedItems.length
						: 0;
				}
			});
			setActiveIndex(closestIndex);
		};

		track.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => {
			track.removeEventListener("scroll", handleScroll);
		};
	}, [displayedItems.length]);

	const handleUpvoteChange = useCallback(
		(listKey: "today" | "new", productId: number) =>
			(nextCount: number, nextHasUpvoted: boolean) => {
				const updateList = listKey === "today" ? setTodayItems : setNewItems;
				updateList((prev) =>
					prev.map((item) =>
						item.id === productId
							? {
									...item,
									upvote_count: nextCount,
									has_upvoted: nextHasUpvoted,
								}
							: item,
					),
				);
			},
		[],
	);

	return (
		<div className="homepage">
			<AppHeaderWithAuth activePath="/" />
			{/* ヒーロー */}
			<Box className="hero-section">
				<Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 5 }}>
					<Box className="hero-content">
						<Typography variant="h1" className="hero-title">
							Nice dig
						</Typography>
						<Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
							今日の個人開発を発掘する
						</Typography>
						<Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
							いいと思ったら ▲で応援。毎日ランキング更新。
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
					今日の発掘
				</Typography>
				<Tabs
					value={activeTab}
					onChange={(_, value) => setActiveTab(value)}
					variant="fullWidth"
					sx={{ mt: 2 }}
				>
					<Tab value="today" label="Today" />
					<Tab value="new" label="New" />
				</Tabs>

				{activeTab === "today" ? (
					todayLoading ? (
						<Box className="loading-container">
							<CircularProgress />
						</Box>
					) : todayItems.length === 0 ? (
						<Alert
							severity={todayError ? "error" : "info"}
							className="api-error-alert"
						>
							{todayError ??
								todayEmptyMessage ??
								"現在、表示できるプロジェクトがありません。"}
						</Alert>
					) : (
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
									{repeatedItems.map((project, index) => (
										<Box
											key={`${project.id}-${index}`}
											className={`carousel-item ${todayItems.length && index % todayItems.length === activeIndex ? "active" : ""}`}
											data-index={
												todayItems.length ? index % todayItems.length : 0
											}
										>
											<ProjectCard
												project={project}
												onView={handleViewProject}
												onUpvoteChange={handleUpvoteChange("today", project.id)}
												showTodayMeta
											/>
										</Box>
									))}
								</Box>
							</Box>
						</Box>
					)
				) : newLoading ? (
					<Box className="loading-container">
						<CircularProgress />
					</Box>
				) : newItems.length === 0 ? (
					<Alert
						severity={newError ? "error" : "info"}
						className="api-error-alert"
					>
						{newError ?? "現在、表示できるプロジェクトがありません。"}
					</Alert>
				) : (
					<Box
						className="carousel-section"
						id="newProjectCarousel"
						sx={{ mt: 5, mb: 5 }}
					>
						<Box className="carousel-container">
							<Box className="carousel-track">
								{repeatedItems.map((project, index) => (
									<Box key={`${project.id}-${index}`} className="carousel-item">
										<ProjectCard
											project={project}
											onView={handleViewProject}
											onUpvoteChange={handleUpvoteChange("new", project.id)}
										/>
									</Box>
								))}
							</Box>
						</Box>
					</Box>
				)}
			</Container>
			{/* カテゴリ */}
			<Box className="category-section">
				<Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
					<Typography variant="h4" className="section-title">
						カテゴリから探す
					</Typography>
					<Box className="category-carousel" sx={{ mt: 4 }}>
						{categoryLoading ? (
							<Box className="loading-container">
								<CircularProgress />
							</Box>
						) : categoryError ? (
							<Alert severity="error" className="api-error-alert">
								{categoryError}
							</Alert>
						) : categories.length === 0 ? (
							<Alert severity="info" className="api-error-alert">
								表示できるカテゴリがありません。
							</Alert>
						) : (
							categories.map((category) => (
								<Box key={category.id} className="carousel-item category-item">
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
										onClick={() => {
											const query = new URLSearchParams();
											const categoryId = Number(category.id);
											if (Number.isFinite(categoryId) && categoryId > 0) {
												query.set("categoryId", String(categoryId));
											}
											if (category.name?.trim()) {
												query.set("category", category.name.trim());
											}
											navigate(`/item?${query.toString()}`);
										}}
									>
										<Box className="category-icon-wrapper">
											{category.image ? (
												<img
													src={category.image}
													alt={category.name}
													loading="lazy"
													className="category-icon-image"
												/>
											) : (
												<CodeIcon fontSize="large" color="primary" />
											)}
										</Box>
										<Typography variant="subtitle1" className="category-name">
											{category.name}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
											className="category-count"
										>
											{category.products_count}件
										</Typography>
									</Button>
								</Box>
							))
						)}
					</Box>
				</Container>
			</Box>
		</div>
	);
};

export default HomePage;
