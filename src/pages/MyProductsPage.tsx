import {
	Alert,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	CircularProgress,
	Container,
	Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import { useAuth } from "../context/AuthContext";
import productApi from "../services/productApi";
import type { Product } from "../types/product";

const MyProductsPage = () => {
	const navigate = useNavigate();
	const { isLoggedIn } = useAuth();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isLoggedIn) {
			navigate("/login", { replace: true });
		}
	}, [isLoggedIn, navigate]);

	useEffect(() => {
		if (!isLoggedIn) return;
		let active = true;

		const fetchProducts = async () => {
			try {
				setLoading(true);
				const items = await productApi.fetchMyProducts();
				const processedItems = items.map((item) => {
					// image_url を配列に変換
					let imageUrls: string[] = [];

					if (typeof item.image_url === "string") {
						try {
							// JSON文字列の場合はパース
							imageUrls = JSON.parse(item.image_url);
						} catch (e) {
							console.error("image_url のパースに失敗:", e);
							// パース失敗時は文字列をそのまま配列に
							imageUrls = item.image_url ? [item.image_url] : [];
						}
					} else if (Array.isArray(item.image_url)) {
						// すでに配列の場合はそのまま使用
						imageUrls = item.image_url;
					}

					// ✅ 各URLに BASE_URL を付与（相対パスの場合）
					const fullImageUrls = imageUrls.map((url) => {
						// すでに完全なURLの場合はそのまま返す
						if (url.startsWith("http://") || url.startsWith("https://")) {
							return url;
						}
						// 相対パスの場合は BASE_URL を付与
						return `https://app.nice-dig.com${url}`;
					});

					return {
						...item,
						image_url: fullImageUrls,
						images: fullImageUrls,
					};
				});
				if (active) {
					setProducts(processedItems);
				}
			} catch (fetchError) {
				console.error(fetchError);
				if (active) setError("投稿済みの作品を取得できませんでした");
			} finally {
				if (active) setLoading(false);
			}
		};

		fetchProducts();
		return () => {
			active = false;
		};
	}, [isLoggedIn]);

	const hasProducts = useMemo(() => products.length > 0, [products.length]);

	if (!isLoggedIn) {
		return null;
	}

	return (
		<div>
			<AppHeaderWithAuth activePath="/my-products" />
			<Container maxWidth="lg" sx={{ py: 4, mt: 6 }}>
				<Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
					<Typography variant="h4">あなたの投稿</Typography>
					<Button variant="contained" onClick={() => navigate("/create")}>
						新しい作品を投稿
					</Button>
				</Box>

				{loading && (
					<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
						<CircularProgress />
					</Box>
				)}

				{!loading && error && <Alert severity="error">{error}</Alert>}

				{!loading && !error && !hasProducts && (
					<Alert severity="info">
						まだ投稿がありません。作品を投稿してみましょう。
					</Alert>
				)}

				{!loading && !error && hasProducts && (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, 1fr)",
								md: "repeat(3, 1fr)",
							},
							gap: 3,
						}}
					>
						{products.map((product) => {
							const images = Array.isArray(product.image_url)
								? product.image_url
								: typeof product.image_url === "string" &&
										product.image_url !== ""
									? [product.image_url]
									: [];
							return (
								<Card key={product.id}>
									{images[0] && (
										<CardMedia
											component="img"
											height="160"
											image={images[0]}
											alt={product.name}
										/>
									)}
									<CardContent>
										<Typography variant="h6" gutterBottom>
											{product.name}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{(product.description as string | null) ??
												"説明がありません"}
										</Typography>
									</CardContent>
									<CardActions sx={{ justifyContent: "flex-end" }}>
										<Button
											size="small"
											onClick={() => navigate(`/item/${product.id}`)}
										>
											詳細へ
										</Button>
										<Button
											size="small"
											variant="outlined"
											onClick={() => navigate(`/edit/${product.id}`)}
										>
											編集
										</Button>
									</CardActions>
								</Card>
							);
						})}
					</Box>
				)}
			</Container>
		</div>
	);
};

export default MyProductsPage;
