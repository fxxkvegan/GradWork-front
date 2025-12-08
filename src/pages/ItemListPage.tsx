import {
	Alert,
	Box,
	Breadcrumbs,
	Button,
	Card,
	CardContent,
	CardMedia,
	Checkbox,
	Chip,
	CircularProgress,
	Container,
	FormControlLabel,
	FormGroup,
	Grid,
	Pagination,
	Paper,
	Rating,
	Stack,
	Typography,
} from "@mui/material";
import { type ChangeEvent, type FC, useEffect, useMemo, useState } from "react";
import {
	Link as RouterLink,
	useNavigate,
	useSearchParams,
} from "react-router-dom";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import { fetchCategories } from "../services/categoryApi";
import { fetchProducts } from "../services/productApi";
import type { Category } from "../types/category";
import type { Product } from "../types/product";
import "./ItemListPage.css";
import { Link as MuiLink } from "@mui/material";

const ITEMS_PER_PAGE = 9;
const FALLBACK_IMAGE = "/nice_dig.png";
const CATEGORY_ID_PARAM = "categoryId";
const CATEGORY_IDS_PARAM = "categoryIds";

const normalizeCategoryIds = (ids: number[]): number[] => {
	const seen = new Set<number>();
	const normalized: number[] = [];
	ids.forEach((id) => {
		const numericId = Number(id);
		if (Number.isFinite(numericId) && numericId > 0 && !seen.has(numericId)) {
			seen.add(numericId);
			normalized.push(numericId);
		}
	});
	return normalized.sort((a, b) => a - b);
};

const parseCategoryIdsFromParams = (params: URLSearchParams): number[] => {
	const collected: number[] = [];
	const appendFromValue = (value: string | null) => {
		if (!value) return;
		value
			.split(",")
			.map((v) => v.trim())
			.filter((v) => v !== "")
			.forEach((segment) => {
				const parsed = Number(segment);
				if (Number.isFinite(parsed) && parsed > 0) {
					collected.push(parsed);
				}
			});
	};

	params.getAll(CATEGORY_ID_PARAM).forEach(appendFromValue);
	params.getAll(CATEGORY_IDS_PARAM).forEach(appendFromValue);

	return normalizeCategoryIds(collected);
};

const arraysEqual = (a: number[], b: number[]): boolean => {
	if (a.length !== b.length) return false;
	return a.every((value, index) => value === b[index]);
};

const resolveImageUrl = (image: Product["image_url"]) => {
	if (Array.isArray(image)) {
		return image[0] ?? FALLBACK_IMAGE;
	}

	if (typeof image === "string" && image.trim() !== "") {
		return image;
	}

	return FALLBACK_IMAGE;
};

const ItemListPage: FC = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [products, setProducts] = useState<Product[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [categoryLoading, setCategoryLoading] = useState(false);
	const [categoryError, setCategoryError] = useState<string | null>(null);
	const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(() =>
		parseCategoryIdsFromParams(searchParams),
	);

	const updateCategoryQuery = (nextIds: number[]) => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete(CATEGORY_ID_PARAM);
		params.delete(CATEGORY_IDS_PARAM);
		params.delete("category");
		params.delete("page");
		if (nextIds.length) {
			nextIds.forEach((id) => params.append(CATEGORY_ID_PARAM, String(id)));
			params.set("page", "1");
		}
		setSearchParams(params);
	};

	useEffect(() => {
		const queryCategoryIds = parseCategoryIdsFromParams(searchParams);
		let changed = false;
		setSelectedCategoryIds((prev) => {
			if (arraysEqual(prev, queryCategoryIds)) {
				return prev;
			}
			changed = true;
			return queryCategoryIds;
		});
		if (changed) {
			setPage(1);
		}
	}, [searchParams]);

	const categoryMap = useMemo(() => {
		return categories.reduce((map, category) => {
			map.set(String(category.id), category);
			return map;
		}, new Map<string, Category>());
	}, [categories]);

	const headingTitle = useMemo(() => {
		if (selectedCategoryIds.length === 1) {
			const category = categoryMap.get(String(selectedCategoryIds[0]));
			if (category) {
				return `${category.name}プロジェクト一覧`;
			}
		}
		return "プロジェクト一覧";
	}, [categoryMap, selectedCategoryIds]);

	useEffect(() => {
		let isMounted = true;
		const loadProducts = async () => {
			setLoading(true);
			setError(null);
			try {
				const { items, pagination } = await fetchProducts({
					page,
					limit: ITEMS_PER_PAGE,
					categoryIds: selectedCategoryIds,
				});
				if (!isMounted) return;
				setProducts(items);
				setTotalPages(pagination.lastPage);
				setTotalItems(pagination.total);
			} catch (err) {
				if (!isMounted) return;
				setError(
					err instanceof Error
						? err.message
						: "プロダクト一覧の取得に失敗しました",
				);
				setProducts([]);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};
		loadProducts();
		return () => {
			isMounted = false;
		};
	}, [page, selectedCategoryIds]);

	useEffect(() => {
		let isMounted = true;
		const loadCategories = async () => {
			setCategoryLoading(true);
			setCategoryError(null);
			try {
				const items = await fetchCategories();
				if (!isMounted) return;
				setCategories(items);
			} catch (err) {
				if (!isMounted) return;
				setCategoryError(
					err instanceof Error ? err.message : "カテゴリの取得に失敗しました",
				);
				setCategories([]);
			} finally {
				if (isMounted) {
					setCategoryLoading(false);
				}
			}
		};
		loadCategories();
		return () => {
			isMounted = false;
		};
	}, []);

	const handleViewDetails = (productId: number) => {
		navigate(`/item/${productId}`);
	};

	const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
		setPage(value);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleCategoryToggle =
		(categoryId: number) => (event: ChangeEvent<HTMLInputElement>) => {
			const isChecked = event.target.checked;
			const nextIds = normalizeCategoryIds(
				isChecked
					? [...selectedCategoryIds, categoryId]
					: selectedCategoryIds.filter((id) => id !== categoryId),
			);
			if (arraysEqual(selectedCategoryIds, nextIds)) {
				return;
			}
			setSelectedCategoryIds(nextIds);
			setPage(1);
			updateCategoryQuery(nextIds);
		};

	const handleClearCategories = () => {
		if (selectedCategoryIds.length === 0) {
			return;
		}
		setSelectedCategoryIds([]);
		setPage(1);
		updateCategoryQuery([]);
	};

	const selectedCategoryNames = useMemo(() => {
		if (selectedCategoryIds.length === 0) {
			return [] as string[];
		}
		return categories
			.filter((category) => selectedCategoryIds.includes(category.id))
			.map((category) => category.name);
	}, [categories, selectedCategoryIds]);

	const multiCategoryLabel = useMemo(() => {
		if (selectedCategoryIds.length <= 1) {
			return "";
		}
		if (selectedCategoryNames.length === 0) {
			return `カテゴリを${selectedCategoryIds.length}件選択中`;
		}
		const preview = selectedCategoryNames.slice(0, 2).join("、");
		const remaining = selectedCategoryNames.length - 2;
		return remaining > 0 ? `${preview} 、ほか${remaining}件` : preview;
	}, [selectedCategoryIds.length, selectedCategoryNames]);

	const breadcrumbItems = useMemo(() => {
		const items: Array<{ label: string; to?: string }> = [
			{ label: "Home", to: "/" },
		];
		if (selectedCategoryIds.length === 1) {
			const selectedId = selectedCategoryIds[0];
			const category = categoryMap.get(String(selectedId));
			const label = category?.name?.trim().length
				? category.name.trim()
				: `カテゴリID: ${selectedId}`;
			const params = new URLSearchParams();
			params.set(CATEGORY_ID_PARAM, String(selectedId));
			if (category?.name?.trim()) {
				params.set("category", category.name.trim());
			}
			items.push({ label, to: `/item?${params.toString()}` });
		} else if (selectedCategoryIds.length > 1) {
			items.push({ label: multiCategoryLabel });
		} else {
			items.push({ label: "プロジェクト一覧" });
		}
		return items;
	}, [categoryMap, multiCategoryLabel, selectedCategoryIds]);

	const headingMessage = useMemo(() => {
		if (loading) {
			return "読み込み中...";
		}
		if (totalItems > 0) {
			return `全${totalItems}件のプロジェクト`;
		}
		if (selectedCategoryIds.length > 0) {
			return "選択したカテゴリに該当するプロジェクトはありません";
		}
		return "公開中のプロジェクトはまだありません";
	}, [loading, totalItems, selectedCategoryIds.length]);

	const isFiltering = selectedCategoryIds.length > 0;

	return (
		<>
			<AppHeaderWithAuth />
			<Box component="main" className="item-list-page">
				<Container maxWidth="lg" sx={{ py: 4 }}>
					<Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }} separator="/">
						{breadcrumbItems.map((item, index) => {
							const isLast = index === breadcrumbItems.length - 1;
							if (!isLast && item.to) {
								return (
									<MuiLink
										component={RouterLink}
										to={item.to}
										underline="hover"
										color="inherit"
										key={`${item.label}-${index}`}
									>
										{item.label}
									</MuiLink>
								);
							}
							return (
								<Typography
									key={`${item.label}-${index}`}
									color={isLast ? "text.primary" : "text.secondary"}
								>
									{item.label}
								</Typography>
							);
						})}
					</Breadcrumbs>
					<Typography variant="h4" component="h1" gutterBottom align="center">
						{headingTitle}
					</Typography>
					<Typography
						variant="body1"
						align="center"
						color="text.secondary"
						paragraph
					>
						{headingMessage}
					</Typography>

					<Paper sx={{ p: 2, mb: 3 }} variant="outlined">
						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={1.5}
							alignItems={{ xs: "flex-start", sm: "center" }}
							justifyContent="space-between"
						>
							<Box>
								<Typography variant="subtitle1" component="h2">
									カテゴリで絞り込む
								</Typography>
								<Typography variant="body2" color="text.secondary">
									気になるカテゴリを複数選択できます
								</Typography>
							</Box>
							{isFiltering ? (
								<Button size="small" onClick={handleClearCategories}>
									選択をクリア
								</Button>
							) : null}
						</Stack>
						<Box sx={{ mt: 2 }}>
							{categoryLoading ? (
								<Stack direction="row" spacing={1} alignItems="center">
									<CircularProgress size={20} />
									<Typography variant="body2" color="text.secondary">
										カテゴリを読み込み中です
									</Typography>
								</Stack>
							) : categoryError ? (
								<Alert severity="warning">{categoryError}</Alert>
							) : categories.length === 0 ? (
								<Typography variant="body2" color="text.secondary">
									表示できるカテゴリがありません
								</Typography>
							) : (
								<FormGroup row sx={{ gap: 1 }}>
									{categories.map((category) => (
										<FormControlLabel
											key={category.id}
											control={
												<Checkbox
													size="small"
													checked={selectedCategoryIds.includes(category.id)}
													onChange={handleCategoryToggle(category.id)}
												/>
											}
											label={`${category.name} (${category.products_count})`}
											sx={{ mr: 0 }}
										/>
									))}
								</FormGroup>
							)}
						</Box>
						{selectedCategoryNames.length > 0 ? (
							<Stack
								direction="row"
								spacing={1}
								useFlexGap
								flexWrap="wrap"
								sx={{ mt: 2 }}
							>
								{selectedCategoryNames.map((name) => (
									<Chip
										key={name}
										label={name}
										size="small"
										variant="outlined"
									/>
								))}
							</Stack>
						) : null}
					</Paper>

					{error ? (
						<Alert severity="error" sx={{ mb: 3 }}>
							{error}
						</Alert>
					) : null}

					{loading ? (
						<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
							<CircularProgress />
						</Box>
					) : (
						<Grid container spacing={3} sx={{ mt: 1 }}>
							{products.map((product) => {
								const productCategories = (product.categoryIds ?? [])
									.map((categoryId) => categoryMap.get(categoryId))
									.filter((category): category is Category => Boolean(category))
									.slice(0, 3);

								return (
									<Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
										<Card
											sx={{
												height: "100%",
												display: "flex",
												flexDirection: "column",
												transition:
													"transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
												"&:hover": {
													transform: "translateY(-4px)",
													boxShadow: 4,
												},
											}}
										>
											<CardMedia
												component="img"
												height="200"
												image={resolveImageUrl(product.image_url)}
												alt={product.name}
												sx={{ objectFit: "cover" }}
											/>
											<CardContent
												sx={{
													flexGrow: 1,
													display: "flex",
													flexDirection: "column",
												}}
											>
												<Typography
													variant="h6"
													component="h2"
													gutterBottom
													noWrap
												>
													{product.name}
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
													paragraph
												>
													{product.description ?? "説明は登録されていません"}
												</Typography>

												{/* 評価 */}
												<Box
													sx={{ display: "flex", alignItems: "center", mb: 2 }}
												>
													<Rating
														value={Number(product.rating) || 0}
														precision={0.1}
														readOnly
														size="small"
													/>
													<Typography variant="caption" sx={{ ml: 1 }}>
														DL {product.access_count ?? 0}
													</Typography>
												</Box>

												{/* カテゴリ */}
												<Box sx={{ mb: 2 }}>
													{productCategories.length > 0 ? (
														productCategories.map((category) => (
															<Chip
																key={category.id}
																label={category.name}
																size="small"
																sx={{ mr: 0.5, mb: 0.5 }}
															/>
														))
													) : (
														<Typography
															variant="caption"
															color="text.secondary"
														>
															カテゴリ未設定
														</Typography>
													)}
												</Box>

												<Box sx={{ mt: "auto" }}>
													<Button
														variant="contained"
														fullWidth
														onClick={() => handleViewDetails(product.id)}
													>
														詳細を見る
													</Button>
												</Box>
											</CardContent>
										</Card>
									</Grid>
								);
							})}
							{products.length === 0 ? (
								<Grid size={{ xs: 12 }}>
									<Typography align="center" color="text.secondary">
										表示できるプロジェクトがありません
									</Typography>
								</Grid>
							) : null}
						</Grid>
					)}

					<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
						<Pagination
							count={Math.max(totalPages, 1)}
							page={page}
							onChange={handlePageChange}
							color="primary"
							disabled={loading || totalPages <= 1}
						/>
					</Box>
				</Container>
			</Box>
		</>
	);
};

export default ItemListPage;
