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
	Grid,
	Pagination,
	Rating,
	Typography,
} from "@mui/material";
import { type ChangeEvent, type FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import { fetchProducts } from "../services/productApi";
import type { Product } from "../types/product";
import "./ItemListPage.css";

const ITEMS_PER_PAGE = 9;
const FALLBACK_IMAGE = "/nice_dig.png";

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
	const [products, setProducts] = useState<Product[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		const loadProducts = async () => {
			setLoading(true);
			setError(null);
			try {
				const { items, pagination } = await fetchProducts({
					page,
					limit: ITEMS_PER_PAGE,
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
	}, [page]);

	const handleViewDetails = (productId: number) => {
		navigate(`/item/${productId}`);
	};

	const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
		setPage(value);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const headingMessage = useMemo(() => {
		if (loading) {
			return "読み込み中...";
		}
		return totalItems > 0
			? `全${totalItems}件のプロジェクト`
			: "公開中のプロジェクトはまだありません";
	}, [loading, totalItems]);

	return (
		<>
			<AppHeaderWithAuth />
			<Box component="main" className="item-list-page">
				<Container maxWidth="lg" sx={{ py: 4 }}>
					<Typography variant="h4" component="h1" gutterBottom align="center">
						プロジェクト一覧
					</Typography>
					<Typography
						variant="body1"
						align="center"
						color="text.secondary"
						paragraph
					>
						{headingMessage}
					</Typography>

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
							{products.map((product) => (
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
													DL {product.download_count ?? 0}
												</Typography>
											</Box>

											{/* カテゴリ */}
											<Box sx={{ mb: 2 }}>
												{product.categories?.slice(0, 3).map((category) => (
													<Chip
														key={category.id}
														label={category.name}
														size="small"
														sx={{ mr: 0.5, mb: 0.5 }}
													/>
												))}
												{!product.categories?.length ? (
													<Typography variant="caption" color="text.secondary">
														カテゴリ未設定
													</Typography>
												) : null}
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
							))}
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
