import {
	ArrowBack as ArrowBackIcon,
	Download as DownloadIcon,
	FavoriteBorder as FavoriteBorderIcon,
	Favorite as FavoriteIcon,
	Share as ShareIcon,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardMedia,
	Chip,
	Container,
	Divider,
	IconButton,
	Paper,
	Rating,
	Skeleton,
	Stack,
	Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import "./ItemDetailPage.css";
import axios from "axios";
import { API_CONFIG } from "../constants/api";

// プロジェクト詳細の型定義
interface ProjectDetail {
	id: number;
	name: string;
	title?: string;
	description: string;
	shortDescription?: string;
	longDescription?: string;
	image_url: string[];
	images?: string[];
	rating: number | { average: number; count: number };
	download_count?: number;
	downloadCount?: number;
	created_at?: string;
	updated_at?: string;
	lastUpdated?: string;
	categoryIds?: number[];
	categories?: Array<{ id: number; name: string }>;
	price?: number;
	isFree?: boolean;
	features?: string[];
	technicalDetails?: {
		framework: string[];
		language: string[];
		database?: string[];
		tools?: string[];
	};
	systemRequirements?: {
		os: string;
		browser: string;
		memory: string;
	};
	author?: { name: string; avatar: string; rating: number };
	version?: string;
}

const getDemoProjectDetail = (id: string): ProjectDetail => ({
	id: +id,
	name: "React E-commerce Platform",
	title: "React E-commerce Platform",
	description:
		"モダンなReactとTypeScriptで構築された本格的なEコマースプラットフォーム",
	shortDescription: "レスポンシブ対応のECプラットフォーム",
	longDescription: `このプロジェクトは、最新のReact 18とTypeScriptを使用して構築された、
本格的なEコマースプラットフォームです。

• 完全レスポンシブデザイン
• ショッピングカート機能
• ユーザー認証システム
• 管理者ダッシュボード
• 決済システム統合
• SEO最適化済み

開発者にとって理解しやすく、カスタマイズしやすい構造になっています。`,
	images: ["/nice_dig.png", "/nice_dig.png", "/nice_dig.png"],
	image_url: ["/nice_dig.png", "/nice_dig.png", "/nice_dig.png"],
	price: 15000,
	isFree: false,
	rating: { average: 4.5, count: 128 },
	features: [
		"レスポンシブデザイン",
		"ショッピングカート",
		"ユーザー認証",
		"管理者機能",
		"決済システム",
		"SEO対応",
		"PWA対応",
		"多言語対応",
	],
	technicalDetails: {
		framework: ["React 18", "Material-UI", "Redux Toolkit"],
		language: ["TypeScript", "JavaScript", "HTML5", "CSS3"],
		database: ["PostgreSQL", "Redis"],
		tools: ["Vite", "ESLint", "Prettier", "Jest"],
	},
	systemRequirements: {
		os: "Windows 10+, macOS 10.15+, Linux Ubuntu 18+",
		browser: "Chrome 90+, Firefox 88+, Safari 14+",
		memory: "8GB RAM 推奨",
	},
	author: { name: "TechDeveloper", avatar: "/nice_dig.png", rating: 4.8 },
	downloadCount: 1250,
	download_count: 1250,
	lastUpdated: "2024-06-15",
	updated_at: "2024-06-15",
	version: "2.1.0",
});

interface ItemDetailPageProps {
	demoMode?: boolean;
}

export default function ItemDetailPage({
	demoMode = false,
}: ItemDetailPageProps) {
	const { itemId } = useParams<{ itemId?: string }>();
	const navigate = useNavigate();
	const { search } = useLocation();
	const isDemoMode =
		demoMode || new URLSearchParams(search).get("demo") === "true";

	const [project, setProject] = useState<ProjectDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isFavorite, setIsFavorite] = useState(false);
	const [activeImageIndex, setActiveImageIndex] = useState(0);

	useEffect(() => {
		if (isDemoMode && itemId) {
			setProject(getDemoProjectDetail(itemId));
			setLoading(false);
			return;
		}

		if (!itemId) {
			setError("プロジェクトIDが取得できませんでした");
			setLoading(false);
			return;
		}

		const fetchProject = async () => {
			try {
				setLoading(true);
				setError(null);
				const res = await axios.get<ProjectDetail>(
					`${API_CONFIG.BASE_URL}/products/${itemId}`,
				);
				if (res.data) {
					const processedData = {
						...res.data,
						image_url:
							typeof res.data.image_url === "string"
								? JSON.parse(res.data.image_url)
								: res.data.image_url,
						images:
							typeof res.data.image_url === "string"
								? JSON.parse(res.data.image_url)
								: res.data.image_url,
					};
					const fullImageUrls = res.data.image_url.map((url) => {
						// すでに完全なURLの場合はそのまま返す
						if (url.startsWith("http://") || url.startsWith("https://")) {
							return url;
						}
						// 相対パスの場合は BASE_URL を付与
						return `https://app.nice-dig.com${url}`;
					});
					processedData.image_url = fullImageUrls;
					processedData.images = fullImageUrls;
					setProject(processedData);
				} else {
					setError("プロジェクトデータが見つかりませんでした");
				}
			} catch (e) {
				if (!isDemoMode && axios.isAxiosError(e)) {
					if (e.response?.status === 404) {
						setError("プロジェクトが見つかりませんでした");
					} else if (e.response?.status === 500) {
						setError("サーバーエラーが発生しました");
					} else {
						setError("プロジェクトの取得に失敗しました");
					}
				} else if (!isDemoMode) {
					setError("ネットワークエラーが発生しました");
				} else {
					setProject(getDemoProjectDetail(itemId));
					setError(null);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchProject();
	}, [itemId, isDemoMode]);

	const imageList = useMemo(() => {
		if (!project) {
			return [] as string[];
		}
		const fromImages = Array.isArray(project.images)
			? project.images.filter(
					(value): value is string =>
						typeof value === "string" && value.length > 0,
				)
			: [];
		if (fromImages.length > 0) {
			return fromImages;
		}
		return Array.isArray(project.image_url)
			? project.image_url.filter(
					(value): value is string =>
						typeof value === "string" && value.length > 0,
				)
			: [];
	}, [project]);

	useEffect(() => {
		setActiveImageIndex(0);
	}, [project?.id]);

	useEffect(() => {
		if (activeImageIndex >= imageList.length && imageList.length > 0) {
			setActiveImageIndex(imageList.length - 1);
		}
	}, [activeImageIndex, imageList]);

	const handleDownload = () => {
		alert("ダウンロード機能はデモ版のため利用できません");
	};

	const handleFavorite = () => {
		setIsFavorite((f) => !f);
	};

	const handleShare = () => {
		navigator.clipboard.writeText(window.location.href);
		alert("URLをクリップボードにコピーしました");
	};

	const handleBack = () => {
		navigate(-1);
	};

	if (loading) {
		return (
			<div className="item-detail-page">
				<AppHeaderWithAuth activePath={`/item/${itemId}`} />
				<Container maxWidth="lg" sx={{ py: 4, mt: 6 }}>
					<Skeleton variant="rectangular" width="100%" height={400} />
					<Box sx={{ mt: 3 }}>
						<Skeleton variant="text" sx={{ fontSize: "2rem" }} />
						<Skeleton variant="text" width="60%" />
						<Skeleton variant="text" width="40%" />
					</Box>
				</Container>
			</div>
		);
	}

	if (error) {
		return (
			<div className="item-detail-page">
				<AppHeaderWithAuth activePath={`/item/${itemId}`} />
				<Container maxWidth="lg" sx={{ py: 4, mt: 6 }}>
					<Typography variant="h5" align="center" color="error">
						{error}
					</Typography>
					<Box sx={{ textAlign: "center", mt: 2 }}>
						<Button variant="contained" onClick={handleBack}>
							戻る
						</Button>
					</Box>
				</Container>
			</div>
		);
	}

	if (!project) {
		return (
			<div className="item-detail-page">
				<AppHeaderWithAuth activePath={`/item/${itemId}`} />
				<Container maxWidth="lg" sx={{ py: 4, mt: 6 }}>
					<Typography variant="h5" align="center">
						プロジェクトが見つかりませんでした
					</Typography>
					<Box sx={{ textAlign: "center", mt: 2 }}>
						<Button variant="contained" onClick={handleBack}>
							戻る
						</Button>
					</Box>
				</Container>
			</div>
		);
	}

	return (
		<div className="item-detail-page">
			<AppHeaderWithAuth activePath={`/item/${itemId}`} />
			<Container maxWidth="lg" sx={{ py: 4, mt: 6 }}>
				<Box sx={{ mb: 3 }}>
					<Button
						startIcon={<ArrowBackIcon />}
						onClick={handleBack}
						sx={{ mb: 2 }}
					>
						一覧に戻る
					</Button>
				</Box>
				<Box
					sx={{
						display: "flex",
						gap: 4,
						flexDirection: { xs: "column", lg: "row" },
					}}
				>
					{/* 左側：メイン */}
					<Box sx={{ flex: 2, minWidth: 0 }}>
						<Card sx={{ mb: 3 }}>
							{imageList[activeImageIndex] ? (
								<CardMedia
									component="img"
									height="400"
									image={imageList[activeImageIndex]}
									alt={project.title || project.name}
									sx={{ objectFit: "cover" }}
								/>
							) : (
								<Box
									sx={{
										height: 400,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "text.secondary",
									}}
								>
									<Typography variant="body2">
										画像が登録されていません
									</Typography>
								</Box>
							)}
						</Card>
						<Box sx={{ display: "flex", gap: 1, mb: 3, overflowX: "auto" }}>
							{imageList.map((img, i) => (
								<Box
									key={i}
									onClick={() => setActiveImageIndex(i)}
									sx={{
										minWidth: 120,
										height: 80,
										borderRadius: 1,
										overflow: "hidden",
										cursor: "pointer",
										border: i === activeImageIndex ? "2px solid" : "1px solid",
										borderColor:
											i === activeImageIndex ? "primary.main" : "grey.300",
									}}
								>
									<img
										src={img}
										alt={`${project.title || project.name} ${i + 1}`}
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
									/>
								</Box>
							))}
						</Box>
						<Paper sx={{ p: 3, mb: 3 }}>
							<Typography variant="h6" gutterBottom>
								プロジェクト詳細
							</Typography>
							<Typography
								variant="body1"
								sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}
							>
								{project.longDescription || project.description}
							</Typography>
						</Paper>
						<Paper sx={{ p: 3 }}>
							<Typography variant="h6" gutterBottom>
								使用技術・主要機能・システム要件
							</Typography>
							{project.technicalDetails && (
								<>
									<Box sx={{ mb: 3 }}>
										<Typography
											variant="subtitle2"
											color="text.secondary"
											gutterBottom
										>
											フレームワーク・ライブラリ
										</Typography>
										<Box sx={{ mb: 2 }}>
											{project.technicalDetails.framework.map((t, i) => (
												<Chip
													key={i}
													label={t}
													size="small"
													sx={{ mr: 1, mb: 1 }}
												/>
											))}
										</Box>
									</Box>
									<Box sx={{ mb: 3 }}>
										<Typography
											variant="subtitle2"
											color="text.secondary"
											gutterBottom
										>
											プログラミング言語
										</Typography>
										<Box>
											{project.technicalDetails.language.map((l, i) => (
												<Chip
													key={i}
													label={l}
													variant="outlined"
													size="small"
													sx={{ mr: 1, mb: 1 }}
												/>
											))}
										</Box>
									</Box>
								</>
							)}
							{project.features && (
								<>
									<Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
										主要機能
									</Typography>
									<Box sx={{ mb: 3 }}>
										{project.features.map((f, i) => (
											<Chip
												key={i}
												label={f}
												variant="outlined"
												sx={{ mr: 1, mb: 1 }}
											/>
										))}
									</Box>
								</>
							)}
							{project.systemRequirements && (
								<>
									<Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
										システム要件
									</Typography>
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
											gap: 2,
											mb: 2,
										}}
									>
										<Box>
											<Typography
												variant="subtitle2"
												color="text.secondary"
												gutterBottom
											>
												OS
											</Typography>
											<Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
												{project.systemRequirements.os}
											</Typography>
										</Box>
										<Box>
											<Typography
												variant="subtitle2"
												color="text.secondary"
												gutterBottom
											>
												ブラウザ
											</Typography>
											<Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
												{project.systemRequirements.browser}
											</Typography>
										</Box>
										<Box>
											<Typography
												variant="subtitle2"
												color="text.secondary"
												gutterBottom
											>
												メモリ
											</Typography>
											<Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
												{project.systemRequirements.memory}
											</Typography>
										</Box>
									</Box>
								</>
							)}
						</Paper>
					</Box>
					{/* 右側：サイド */}
					<Box sx={{ flex: 1, minWidth: 300 }}>
						<Paper className="sticky-sidebar" sx={{ p: 3 }}>
							<Typography variant="h5" gutterBottom>
								{project.title || project.name}
							</Typography>
							<Typography variant="body2" color="text.secondary" paragraph>
								{project.shortDescription || project.description}
							</Typography>
							{((project.categories && project.categories.length > 0) ||
								(project.categoryIds && project.categoryIds.length > 0)) && (
								<Box sx={{ mb: 2 }}>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mb: 0.5 }}
									>
										カテゴリー
									</Typography>
									<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
										{project.categories?.map((category) => (
											<Chip
												key={category.id}
												label={category.name}
												size="small"
												variant="outlined"
											/>
										))}
										{!project.categories?.length &&
											project.categoryIds?.map((id) => (
												<Chip
													key={id}
													label={`カテゴリID: ${id}`}
													size="small"
													variant="outlined"
												/>
											))}
									</Box>
								</Box>
							)}
							<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
								<Rating
									value={
										typeof project.rating === "number"
											? project.rating
											: project.rating.average
									}
									precision={0.1}
									readOnly
									size="small"
								/>
								<Typography variant="caption" sx={{ ml: 1 }}>
									(
									{typeof project.rating === "number"
										? project.rating
										: project.rating.count}
									件)
								</Typography>
							</Box>
							{project.price !== undefined && (
								<Box sx={{ mb: 3 }}>
									{project.isFree ? (
										<Typography variant="h6" color="success.main">
											無料
										</Typography>
									) : (
										<Typography variant="h6">
											¥{project.price.toLocaleString()}
										</Typography>
									)}
								</Box>
							)}
							<Stack spacing={2} sx={{ mb: 3 }}>
								<Button
									variant="contained"
									size="large"
									fullWidth
									startIcon={<DownloadIcon />}
									onClick={handleDownload}
								>
									ダウンロード
								</Button>
								<Box sx={{ display: "flex", gap: 1 }}>
									<IconButton
										onClick={handleFavorite}
										color={isFavorite ? "error" : "default"}
									>
										{isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
									</IconButton>
									<IconButton onClick={handleShare}>
										<ShareIcon />
									</IconButton>
								</Box>
							</Stack>
							<Divider sx={{ my: 2 }} />
							<Box sx={{ mb: 2 }}>
								<Typography variant="body2" color="text.secondary">
									ダウンロード数
								</Typography>
								<Typography variant="body1">
									{(
										project.downloadCount ||
										project.download_count ||
										0
									).toLocaleString()}
								</Typography>
							</Box>
							<Box sx={{ mb: 2 }}>
								<Typography variant="body2" color="text.secondary">
									最終更新
								</Typography>
								<Typography variant="body1">
									{project.lastUpdated || project.updated_at}
								</Typography>
							</Box>
							{project.version && (
								<Box sx={{ mb: 2 }}>
									<Typography variant="body2" color="text.secondary">
										バージョン
									</Typography>
									<Typography variant="body1">{project.version}</Typography>
								</Box>
							)}
							{project.author && (
								<>
									<Divider sx={{ my: 2 }} />
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<Box
											component="img"
											src={project.author.avatar}
											alt={project.author.name}
											sx={{ width: 40, height: 40, borderRadius: "50%", mr: 2 }}
										/>
										<Box>
											<Typography variant="body2" fontWeight="medium">
												{project.author.name}
											</Typography>
											<Rating
												value={project.author.rating}
												precision={0.1}
												readOnly
												size="small"
											/>
										</Box>
									</Box>
								</>
							)}
						</Paper>
					</Box>
				</Box>
			</Container>
		</div>
	);
}
