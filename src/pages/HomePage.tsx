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
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import UserAvatarButton from "../components/UserAvatarButton";
import { useCategoriesList } from "../hooks/useCategoriesList";
import { useRankingProjects } from "../hooks/useRankingProjects";
import * as favorites from "../utils/favorites";

import "./HomePage.css";
import "./carousel-extra.css";
import "./category.css";

import { useNavigate } from "react-router-dom";
import type { HomeProject } from "../types/home";

/* ---------- プロジェクトカード ---------- */
const ProjectCard: React.FC<{
	project: HomeProject;
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

	const ownerName =
		project.owner?.displayName?.trim() || project.owner?.name?.trim() || "";

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
	const carouselRef = useRef<HTMLDivElement | null>(null);
	const {
		projects: rankingProjects,
		loading: rankingLoading,
		error: rankingError,
		emptyMessage: rankingEmptyMessage,
	} = useRankingProjects();
	const {
		categories,
		loading: categoryLoading,
		error: categoryError,
	} = useCategoriesList();
	const [isCarouselPaused, setIsCarouselPaused] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const handleViewProject = useCallback(
		(projectId: number) => {
			navigate(`/item/${projectId}`);
		},
		[navigate],
	);

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
						<Typography variant="h1" className="hero-title">
							Nice dig
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
