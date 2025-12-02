import {
	ArrowBack as ArrowBackIcon,
	Download as DownloadIcon,
	ExpandMore as ExpandMoreIcon,
	FavoriteBorder as FavoriteBorderIcon,
	Favorite as FavoriteIcon,
	Share as ShareIcon,
	StarBorderRounded as StarBorderRoundedIcon,
	StarRounded as StarRoundedIcon,
} from "@mui/icons-material";
import {
	Alert,
	Avatar,
	Box,
	Breadcrumbs,
	Button,
	Card,
	Chip,
	CircularProgress,
	Collapse,
	Container,
	Divider,
	IconButton,
	Link as MuiLink,
	Paper,
	Skeleton,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import {
	type ChangeEvent,
	type FormEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Link as RouterLink,
	useLocation,
	useNavigate,
	useParams,
} from "react-router-dom";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import "./ItemDetailPage.css";
import axios from "axios";
import { API_CONFIG } from "../constants/api";
import { useAuth } from "../context/AuthContext";
import productApi from "../services/productApi";
import type { Review } from "../types/review";

// プロジェクト詳細の型定義
interface ProjectOwner {
	id: number;
	name: string;
	displayName?: string | null;
	avatarUrl?: string | null;
	headerUrl?: string | null;
	bio?: string | null;
	location?: string | null;
	website?: string | null;
}

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
	owner?: ProjectOwner | null;
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
	owner: {
		id: 0,
		name: "TechDeveloper",
		displayName: "TechDeveloper",
		avatarUrl: "/nice_dig.png",
		headerUrl: null,
		bio: null,
		location: null,
		website: null,
	},
	author: { name: "TechDeveloper", avatar: "/nice_dig.png", rating: 4.8 },
	downloadCount: 1250,
	download_count: 1250,
	lastUpdated: "2024-06-15",
	updated_at: "2024-06-15",
	version: "2.1.0",
});

const MAX_RATING = 5;
const MIN_RATING = 0.5;
const RATING_STEP = 0.5;

const STAR_COLORS = {
	filled: "#F59E0B",
	highlighted: "#FB923C",
	empty: "#E5E7EB",
} as const;

interface FractionalStarProps {
	fraction: number;
	size: number;
	isHighlighted: boolean;
	isFilled: boolean;
}

const FractionalStar = ({
	fraction,
	size,
	isHighlighted,
	isFilled,
}: FractionalStarProps) => {
	const clampedFraction = Math.max(0, Math.min(fraction, 1));
	const fillColor = isHighlighted
		? STAR_COLORS.highlighted
		: isFilled || clampedFraction > 0
			? STAR_COLORS.filled
			: STAR_COLORS.empty;

	return (
		<Box
			sx={{
				position: "relative",
				width: size,
				height: size,
				flex: "0 0 auto",
			}}
		>
			<StarBorderRoundedIcon
				sx={{
					width: size,
					height: size,
					color: STAR_COLORS.empty,
					pointerEvents: "none",
				}}
			/>
			{clampedFraction > 0 && (
				<StarRoundedIcon
					sx={{
						width: size,
						height: size,
						color: fillColor,
						position: "absolute",
						left: 0,
						top: 0,
						clipPath: `inset(0 ${(1 - clampedFraction) * 100}% 0 0)`,
						transition: "color 0.2s ease",
						pointerEvents: "none",
					}}
				/>
			)}
		</Box>
	);
};

const clampToStep = (value: number) =>
	Math.round(value / RATING_STEP) * RATING_STEP;

const clampRatingValue = (value: number) =>
	Math.min(MAX_RATING, Math.max(MIN_RATING, clampToStep(value) || MIN_RATING));

const trimString = (value?: string | null): string =>
	typeof value === "string" ? value.trim() : "";

interface StarRatingProps {
	value: number;
	onChange?: (value: number) => void;
	readOnly?: boolean;
	size?: number;
	ariaLabel?: string;
}

const StarRating = ({
	value,
	onChange,
	readOnly = false,
	size = 28,
	ariaLabel,
}: StarRatingProps) => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [hoverValue, setHoverValue] = useState<number | null>(null);

	const getValueFromClientX = useCallback(
		(clientX: number) => {
			const element = containerRef.current;
			if (!element) {
				return value;
			}

			const rect = element.getBoundingClientRect();
			const relative = Math.min(Math.max(clientX - rect.left, 0), rect.width);
			const raw = (relative / rect.width) * MAX_RATING;
			return clampRatingValue(raw);
		},
		[value],
	);

	const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
		if (readOnly) {
			return;
		}
		setHoverValue(getValueFromClientX(event.clientX));
	};

	const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
		if (readOnly) {
			return;
		}
		const touch = event.touches[0];
		setHoverValue(getValueFromClientX(touch.clientX));
	};

	const handleMouseLeave = () => {
		if (!readOnly) {
			setHoverValue(null);
		}
	};

	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (readOnly || !onChange) {
			return;
		}
		onChange(getValueFromClientX(event.clientX));
	};

	const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
		if (readOnly || !onChange) {
			return;
		}
		const touch = event.changedTouches[0];
		onChange(getValueFromClientX(touch.clientX));
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (readOnly || !onChange) {
			return;
		}

		if (event.key === "ArrowRight" || event.key === "ArrowUp") {
			event.preventDefault();
			onChange(clampRatingValue(value + RATING_STEP));
			return;
		}

		if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
			event.preventDefault();
			onChange(clampRatingValue(value - RATING_STEP));
			return;
		}

		if (event.key === "Home") {
			event.preventDefault();
			onChange(MIN_RATING);
			return;
		}

		if (event.key === "End") {
			event.preventDefault();
			onChange(MAX_RATING);
		}
	};

	const displayValue = hoverValue ?? value;

	return (
		<Box
			ref={containerRef}
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: 0.5,
				cursor: readOnly ? "default" : "pointer",
				userSelect: "none",
			}}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
			onTouchMove={handleTouchMove}
			onTouchStart={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onKeyDown={handleKeyDown}
			role="slider"
			aria-label={ariaLabel ?? "レビュー評価"}
			aria-valuemin={MIN_RATING}
			aria-valuemax={MAX_RATING}
			aria-valuenow={value}
			aria-valuetext={`${value.toFixed(1)} / ${MAX_RATING}`}
			tabIndex={readOnly ? -1 : 0}
		>
			{Array.from({ length: MAX_RATING }).map((_, index) => {
				const fraction = Math.max(0, Math.min(displayValue - index, 1));
				const isFilled = value - index > 0;
				const isHighlighted = hoverValue !== null && hoverValue - index > 0;
				return (
					<FractionalStar
						key={index}
						fraction={fraction}
						size={size}
						isFilled={isFilled}
						isHighlighted={isHighlighted}
					/>
				);
			})}
		</Box>
	);
};

const formatReviewTimestamp = (value: string): string => {
	if (!value) {
		return "";
	}
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return value;
	}
	return new Intl.DateTimeFormat("ja-JP", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(parsed);
};

interface ReviewFormState {
	title: string;
	body: string;
	rating: number;
}

const INITIAL_REVIEW_FORM: ReviewFormState = {
	title: "",
	body: "",
	rating: 4,
};

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
	const { isLoggedIn, user } = useAuth();

	const productNumericId = useMemo(() => {
		if (!itemId) {
			return null;
		}
		const parsed = Number(itemId);
		return Number.isFinite(parsed) ? parsed : null;
	}, [itemId]);

	const [project, setProject] = useState<ProjectDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isFavorite, setIsFavorite] = useState(false);
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [reviewSummary, setReviewSummary] = useState<{
		average: number;
		count: number;
	}>({
		average: 0,
		count: 0,
	});
	const [reviewsLoading, setReviewsLoading] = useState(true);
	const [reviewsError, setReviewsError] = useState<string | null>(null);
	const [reviewForm, setReviewForm] =
		useState<ReviewFormState>(INITIAL_REVIEW_FORM);
	const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(
		null,
	);
	const [submittingReview, setSubmittingReview] = useState(false);
	const [isReviewSectionOpen, setReviewSectionOpen] = useState(true);

	const applyReviewSummary = useCallback(
		(average: number, count: number) => {
			setReviewSummary({ average, count });
			setProject((previous) => {
				if (!previous) {
					return previous;
				}
				if (typeof previous.rating === "number") {
					return {
						...previous,
						rating: average,
					};
				}
				return {
					...previous,
					rating: {
						...previous.rating,
						average,
						count,
					},
				};
			});
		},
		[setProject],
	);

	const requestReviews = useCallback(async () => {
		if (isDemoMode || !productNumericId) {
			return {
				message: "List of reviews",
				data: [] as Review[],
				average_rating: 0,
				review_count: 0,
			};
		}
		return productApi.fetchProductReviews(productNumericId);
	}, [isDemoMode, productNumericId]);

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
					const initialImages = (() => {
						if (Array.isArray(res.data.image_url)) {
							return res.data.image_url;
						}
						if (
							typeof res.data.image_url === "string" &&
							res.data.image_url !== ""
						) {
							try {
								const parsed = JSON.parse(res.data.image_url);
								return Array.isArray(parsed) ? parsed : [parsed];
							} catch {
								return [res.data.image_url];
							}
						}
						return [] as string[];
					})();

					const apiOrigin = API_CONFIG.BASE_URL.replace(/\/api$/i, "");

					const fullImageUrls = initialImages
						.map((value) => (typeof value === "string" ? value : ""))
						.filter((value): value is string => value.length > 0)
						.map((url) => {
							if (url.startsWith("http://") || url.startsWith("https://")) {
								return url;
							}
							return `${apiOrigin}${url}`;
						});

					const ownerPayload = res.data.owner;
					const owner = ownerPayload
						? {
								id: Number(ownerPayload.id) || 0,
								name: ownerPayload.name ?? "",
								displayName: ownerPayload.displayName ?? null,
								avatarUrl: ownerPayload.avatarUrl ?? null,
								headerUrl: ownerPayload.headerUrl ?? null,
								bio: ownerPayload.bio ?? null,
								location: ownerPayload.location ?? null,
								website: ownerPayload.website ?? null,
							}
						: null;

					const processedData: ProjectDetail = {
						...res.data,
						image_url: fullImageUrls,
						images: fullImageUrls,
						owner,
					};

					if (!processedData.owner && res.data.author) {
						processedData.owner = {
							id: 0,
							name: res.data.author.name,
							displayName: res.data.author.name,
							avatarUrl: res.data.author.avatar,
							headerUrl: null,
							bio: null,
							location: null,
							website: null,
						};
					}

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

	useEffect(() => {
		let cancelled = false;

		const loadReviews = async () => {
			setReviewsLoading(true);
			setReviewsError(null);
			try {
				const response = await requestReviews();
				if (cancelled) {
					return;
				}
				setReviews(response.data);
				applyReviewSummary(response.average_rating, response.review_count);
			} catch (fetchError) {
				if (cancelled) {
					return;
				}
				if (
					axios.isAxiosError(fetchError) &&
					fetchError.response?.status === 404
				) {
					setReviews([]);
					applyReviewSummary(0, 0);
				} else {
					setReviewsError("レビューの取得に失敗しました");
				}
			} finally {
				if (!cancelled) {
					setReviewsLoading(false);
				}
			}
		};

		loadReviews();

		return () => {
			cancelled = true;
		};
	}, [applyReviewSummary, requestReviews]);

	const displayedAverageRating = useMemo(() => {
		if (reviewSummary.count > 0 || reviewSummary.average > 0) {
			return reviewSummary.average;
		}
		if (!project) {
			return 0;
		}
		if (typeof project.rating === "number") {
			return project.rating;
		}
		return project.rating.average ?? 0;
	}, [project, reviewSummary]);

	const formattedAverageRating = useMemo(
		() =>
			Number.isFinite(displayedAverageRating)
				? displayedAverageRating.toFixed(1)
				: "0.0",
		[displayedAverageRating],
	);

	const displayedReviewCount = useMemo(() => {
		if (reviewSummary.count > 0) {
			return reviewSummary.count;
		}
		if (!project) {
			return 0;
		}
		if (typeof project.rating === "number") {
			return 0;
		}
		return project.rating.count ?? 0;
	}, [project, reviewSummary]);

	const ownerDisplayNameRaw = trimString(project?.owner?.displayName);
	const ownerNameRaw = trimString(project?.owner?.name);
	const ownerDisplayName = ownerDisplayNameRaw || ownerNameRaw || null;
	const ownerInitialSource = ownerDisplayName ?? "";
	const ownerInitial =
		ownerInitialSource.length > 0
			? ownerInitialSource.charAt(0).toUpperCase()
			: "U";
	const ownerAvatarUrl = project?.owner?.avatarUrl ?? null;
	const ownerBioValue = trimString(project?.owner?.bio);
	const ownerBio = ownerBioValue.length > 0 ? ownerBioValue : null;

	const isOwnProject =
		user !== null &&
		project?.owner?.id !== undefined &&
		user.id === project.owner.id;

	const primaryCategory = useMemo(() => {
		if (
			!Array.isArray(project?.categories) ||
			project.categories.length === 0
		) {
			return null;
		}
		const validCategory = project.categories.find(
			(category): category is { id: number; name: string } =>
				category !== null &&
				typeof category?.id === "number" &&
				Number.isFinite(category.id),
		);
		return validCategory ?? null;
	}, [project?.categories]);

	const categoryBreadcrumbLabel =
		primaryCategory?.name?.trim() || "プロジェクト一覧";

	const categoryBreadcrumbHref = useMemo(() => {
		if (!primaryCategory) {
			return "/item";
		}
		const params = new URLSearchParams();
		params.set("categoryId", String(primaryCategory.id));
		if (primaryCategory.name?.trim()) {
			params.set("category", primaryCategory.name.trim());
		}
		return `/item?${params.toString()}`;
	}, [primaryCategory]);

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

	const handleToggleReviews = () => {
		setReviewSectionOpen((previous) => !previous);
	};

	const handleBack = () => {
		navigate(-1);
	};

	const handleReviewFieldChange =
		(field: keyof Pick<ReviewFormState, "title" | "body">) =>
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { value: nextValue } = event.target;
			setReviewForm((previous) => ({ ...previous, [field]: nextValue }));
		};

	const handleReviewRatingChange = (nextValue: number) => {
		setReviewForm((previous) => ({
			...previous,
			rating: clampRatingValue(nextValue),
		}));
	};

	const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isDemoMode || !productNumericId) {
			setReviewSubmitError("デモモードではレビューを投稿できません");
			return;
		}
		if (isOwnProject) {
			setReviewSubmitError("自分の投稿にはレビューを投稿できません");
			return;
		}
		if (!reviewForm.title.trim() || !reviewForm.body.trim()) {
			setReviewSubmitError("タイトルとレビュー内容を入力してください");
			return;
		}

		setSubmittingReview(true);
		setReviewSubmitError(null);
		try {
			const payload = {
				title: reviewForm.title.trim(),
				body: reviewForm.body.trim(),
				rating: reviewForm.rating,
			};
			const response = await productApi.createProductReview(
				productNumericId,
				payload,
			);
			applyReviewSummary(response.average_rating, response.review_count);
			if (response.data) {
				const newReview = response.data;
				setReviews((previous) => {
					const filtered = previous.filter((item) => item.id !== newReview.id);
					return [newReview, ...filtered];
				});
			} else {
				const latest = await requestReviews();
				setReviews(latest.data);
				applyReviewSummary(latest.average_rating, latest.review_count);
			}
			setReviewForm(INITIAL_REVIEW_FORM);
		} catch (submissionError) {
			if (axios.isAxiosError(submissionError)) {
				const payload = submissionError.response?.data as
					| {
							message?: string;
							errors?: Record<string, string[]>;
					  }
					| undefined;
				const validationMessage = payload?.errors
					? Object.values(payload.errors)[0]?.[0]
					: undefined;
				setReviewSubmitError(
					validationMessage ??
						payload?.message ??
						"レビューの投稿に失敗しました",
				);
			} else {
				setReviewSubmitError("レビューの投稿に失敗しました");
			}
		} finally {
			setSubmittingReview(false);
		}
	};

	if (loading) {
		return (
			<div className="item-detail-page">
				<AppHeaderWithAuth activePath={`/item/${itemId}`} />
				<Container
					maxWidth="lg"
					sx={{ py: { xs: 3, md: 4 }, mt: { xs: 4, md: 6 } }}
				>
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
				<Container
					maxWidth="lg"
					sx={{ py: { xs: 3, md: 4 }, mt: { xs: 4, md: 6 } }}
				>
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
				<Container
					maxWidth="lg"
					sx={{ py: { xs: 3, md: 4 }, mt: { xs: 4, md: 6 } }}
				>
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
			<Container
				maxWidth="lg"
				sx={{ py: { xs: 3, md: 4 }, mt: { xs: 4, md: 6 } }}
			>
				<Breadcrumbs
					aria-label="breadcrumb"
					sx={{ mb: { xs: 2, md: 3 } }}
					separator="/"
				>
					<MuiLink
						component={RouterLink}
						color="inherit"
						underline="hover"
						to="/"
					>
						Home
					</MuiLink>
					<MuiLink
						component={RouterLink}
						color="inherit"
						underline="hover"
						to={categoryBreadcrumbHref}
					>
						{categoryBreadcrumbLabel}
					</MuiLink>
					<Typography color="text.primary" noWrap>
						{project.title || project.name}
					</Typography>
				</Breadcrumbs>
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
						gap: { xs: 3, lg: 4 },
						flexDirection: { xs: "column", lg: "row" },
					}}
				>
					{/* 左側：メイン */}
					<Box sx={{ flex: 2, minWidth: 0 }}>
						<Card sx={{ mb: 3 }}>
							{imageList[activeImageIndex] ? (
								<Box
									sx={{
										width: "100%",
										aspectRatio: { xs: "4 / 3", md: "16 / 9" },
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										backgroundColor: (theme) => theme.palette.grey[100],
									}}
								>
									<Box
										component="img"
										src={imageList[activeImageIndex]}
										alt={project.title || project.name}
										sx={{
											width: "100%",
											height: "100%",
											objectFit: "contain",
										}}
									/>
								</Box>
							) : (
								<Box
									sx={{
										aspectRatio: { xs: "4 / 3", md: "16 / 9" },
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "text.secondary",
										backgroundColor: (theme) => theme.palette.grey[100],
									}}
								>
									<Typography variant="body2">
										画像が登録されていません
									</Typography>
								</Box>
							)}
						</Card>
						<Box
							sx={{
								display: "flex",
								gap: 1,
								mb: 3,
								overflowX: "auto",
								pb: 0.5,
								scrollSnapType: "x proximity",
							}}
						>
							{imageList.map((img, i) => (
								<Box
									key={i}
									onClick={() => setActiveImageIndex(i)}
									sx={{
										minWidth: { xs: 80, sm: 120 },
										height: { xs: 64, sm: 80 },
										borderRadius: 1,
										overflow: "hidden",
										cursor: "pointer",
										border: i === activeImageIndex ? "2px solid" : "1px solid",
										borderColor:
											i === activeImageIndex ? "primary.main" : "grey.300",
										scrollSnapAlign: "center",
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
						<Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
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
						<Paper sx={{ p: { xs: 2, md: 3 } }}>
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
						<Paper sx={{ p: { xs: 2, md: 3 }, mt: 3 }}>
							<Stack
								direction={{ xs: "column", sm: "row" }}
								alignItems={{ xs: "flex-start", sm: "center" }}
								justifyContent="space-between"
								spacing={{ xs: 1, sm: 2 }}
							>
								<Stack
									direction={{ xs: "column", sm: "row" }}
									alignItems={{ xs: "flex-start", sm: "center" }}
									spacing={{ xs: 0.75, sm: 1.5 }}
								>
									<Typography variant="h6">レビュー</Typography>
									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
										sx={{ flexWrap: "wrap", rowGap: 0.5 }}
									>
										<StarRating
											value={displayedAverageRating}
											readOnly
											size={20}
											ariaLabel="平均評価"
										/>
										<Typography variant="body2" fontWeight={600}>
											{formattedAverageRating} / {MAX_RATING}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											（{displayedReviewCount}件）
										</Typography>
									</Stack>
								</Stack>
								<Button
									variant="text"
									size="small"
									onClick={handleToggleReviews}
									endIcon={
										<ExpandMoreIcon
											sx={{
												transform: isReviewSectionOpen
													? "rotate(180deg)"
													: "rotate(0deg)",
												transition: "transform 0.2s ease",
											}}
										/>
									}
									sx={{
										alignSelf: { xs: "flex-start", sm: "center" },
										fontWeight: 600,
										px: 1.5,
									}}
									aria-expanded={isReviewSectionOpen}
									aria-controls="review-section-content"
								>
									{isReviewSectionOpen ? "閉じる" : "開く"}
								</Button>
							</Stack>
							<Collapse in={isReviewSectionOpen}>
								<Box id="review-section-content" sx={{ mt: 2 }}>
									{isLoggedIn && isOwnProject ? (
										<Alert severity="info" sx={{ mt: 1.5 }}>
											自分の投稿にはレビューを投稿できません。
										</Alert>
									) : (
										<Box
											component="form"
											onSubmit={handleReviewSubmit}
											sx={{ mt: 1.5 }}
											noValidate
										>
											<Stack spacing={2}>
												<Box>
													<Typography variant="subtitle2" sx={{ mb: 0.5 }}>
														あなたの評価
													</Typography>
													<StarRating
														value={reviewForm.rating}
														onChange={handleReviewRatingChange}
														size={28}
														ariaLabel="レビュー評価を選択"
													/>
												</Box>
												<TextField
													label="タイトル"
													value={reviewForm.title}
													onChange={handleReviewFieldChange("title")}
													required
													fullWidth
												/>
												<TextField
													label="レビュー内容"
													value={reviewForm.body}
													onChange={handleReviewFieldChange("body")}
													fullWidth
													required
													multiline
													minRows={4}
												/>
												{reviewSubmitError && (
													<Alert severity="error">{reviewSubmitError}</Alert>
												)}
												<Box
													sx={{ display: "flex", justifyContent: "flex-end" }}
												>
													<Button
														type="submit"
														variant="contained"
														disabled={submittingReview}
													>
														{submittingReview ? "送信中..." : "レビューを投稿"}
													</Button>
												</Box>
											</Stack>
										</Box>
									)}
									<Divider sx={{ my: { xs: 2, md: 3 } }} />
									{reviewsLoading ? (
										<Box
											sx={{ display: "flex", justifyContent: "center", py: 2 }}
										>
											<CircularProgress size={28} />
										</Box>
									) : reviewsError ? (
										<Alert severity="error">{reviewsError}</Alert>
									) : reviews.length === 0 ? (
										<Typography variant="body2" color="text.secondary">
											まだレビューは投稿されていません。
										</Typography>
									) : (
										<Stack spacing={2}>
											{reviews.map((review) => {
												const authorName = review.author_name?.trim().length
													? review.author_name.trim()
													: "匿名ユーザー";
												const authorInitial = authorName
													.charAt(0)
													.toUpperCase();
												const authorAvatarUrl =
													review.author_avatar_url ?? null;

												return (
													<Box
														key={review.id}
														sx={{
															border: "1px solid",
															borderColor: "divider",
															borderRadius: 2,
															p: { xs: 1.75, md: 2 },
														}}
													>
														<Stack
															direction={{ xs: "column", sm: "row" }}
															alignItems={{ xs: "flex-start", sm: "center" }}
															justifyContent="space-between"
															spacing={{ xs: 1, sm: 2 }}
														>
															<Stack
																direction="row"
																spacing={1.5}
																alignItems="center"
															>
																<Avatar
																	src={authorAvatarUrl ?? undefined}
																	alt={authorName}
																	sx={{ width: 36, height: 36 }}
																>
																	{authorInitial}
																</Avatar>
																<Box>
																	<Typography variant="subtitle2">
																		{authorName}
																	</Typography>
																	<Typography
																		variant="caption"
																		color="text.secondary"
																	>
																		{formatReviewTimestamp(review.created_at)}
																	</Typography>
																</Box>
															</Stack>
															<StarRating
																value={review.rating}
																readOnly
																size={18}
																ariaLabel="ユーザーレビュー評価"
															/>
														</Stack>
														{review.title && (
															<Typography variant="subtitle1" sx={{ mt: 1 }}>
																{review.title}
															</Typography>
														)}
														<Typography
															variant="body2"
															sx={{
																mt: review.title ? 0.5 : 1,
																whiteSpace: "pre-line",
																lineHeight: 1.7,
															}}
														>
															{review.body}
														</Typography>
													</Box>
												);
											})}
										</Stack>
									)}
								</Box>
							</Collapse>
						</Paper>
					</Box>
					{/* 右側：サイド */}
					<Box sx={{ flex: 1, minWidth: { xs: "100%", md: 300 } }}>
						<Paper className="sticky-sidebar" sx={{ p: { xs: 2.5, md: 3 } }}>
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
							<Box
								sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
							>
								<StarRating
									value={displayedAverageRating}
									readOnly
									size={20}
									ariaLabel="平均評価"
								/>
								<Typography variant="caption">
									{formattedAverageRating} / {MAX_RATING}（
									{displayedReviewCount}件）
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
							{project.owner && (
								<>
									<Divider sx={{ my: 2 }} />
									<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
										<Avatar
											src={ownerAvatarUrl ?? undefined}
											alt={(ownerDisplayName ?? ownerNameRaw) || "投稿者"}
											sx={{ width: 48, height: 48 }}
										>
											{ownerInitial}
										</Avatar>
										<Box>
											<Typography variant="body2" fontWeight="medium">
												{(ownerDisplayName ?? ownerNameRaw) || "投稿者"}
											</Typography>
											{ownerBio && (
												<Typography variant="caption" color="text.secondary">
													{ownerBio}
												</Typography>
											)}
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
