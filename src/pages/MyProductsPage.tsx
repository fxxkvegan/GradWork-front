import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
	Stack,
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
	const [selectionMode, setSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [deleting, setDeleting] = useState(false);

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
				if (active) {
					setProducts(items);
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
	const hasSelection = selectedIds.length > 0;

	const handleCardClick = (productId: number) => () => {
		if (!selectionMode) {
			return;
		}
		toggleSelection(productId)();
	};

	const toggleSelectionMode = () => {
		setSelectionMode((prev) => {
			if (prev) {
				setSelectedIds([]);
			}
			return !prev;
		});
	};

	const toggleSelection = (productId: number) => () => {
		setSelectedIds((prev) =>
			prev.includes(productId)
				? prev.filter((id) => id !== productId)
				: [...prev, productId],
		);
	};

	const handleDeleteSelected = async () => {
		if (!hasSelection || deleting) {
			return;
		}

		const confirmed = window.confirm(
			`選択した${selectedIds.length}件の作品を削除します。よろしいですか？`,
		);
		if (!confirmed) {
			return;
		}

		try {
			setDeleting(true);
			setError(null);
			await Promise.all(selectedIds.map((id) => productApi.deleteProduct(id)));
			setProducts((prev) =>
				prev.filter((product) => !selectedIds.includes(product.id)),
			);
			setSelectedIds([]);
			setSelectionMode(false);
		} catch (deleteError) {
			console.error(deleteError);
			setError("作品の削除に失敗しました");
		} finally {
			setDeleting(false);
		}
	};

	if (!isLoggedIn) {
		return null;
	}

	return (
		<div>
			<AppHeaderWithAuth activePath="/my-products" />
			<Container maxWidth="lg" sx={{ py: 4, mt: 6 }}>
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						alignItems: { xs: "flex-start", sm: "center" },
						justifyContent: "space-between",
						gap: 2,
						mb: 3,
					}}
				>
					<Typography variant="h4">あなたの投稿</Typography>
					<Stack direction="row" spacing={1} alignItems="center">
						<Button variant="contained" onClick={() => navigate("/create")}>
							新しい作品を投稿
						</Button>
						<Button
							variant={selectionMode ? "contained" : "outlined"}
							onClick={toggleSelectionMode}
						>
							{selectionMode ? "選択モードを終了" : "選択して削除"}
						</Button>
						{selectionMode && hasSelection && (
							<Button
								variant="contained"
								color="error"
								disabled={deleting}
								onClick={handleDeleteSelected}
							>
								{deleting ? "削除中..." : `削除 (${selectedIds.length})`}
							</Button>
						)}
					</Stack>
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
							const isSelected = selectedIds.includes(product.id);
							return (
								<Card
									key={product.id}
									sx={{
										position: "relative",
										border: isSelected ? "2px solid" : undefined,
										borderColor: isSelected ? "primary.main" : "transparent",
										cursor: selectionMode ? "pointer" : "default",
										boxShadow: isSelected ? 6 : 1,
										backgroundColor: isSelected
											? "rgba(25,118,210,0.08)"
											: "background.paper",
										transition:
											"border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
									}}
									onClick={handleCardClick(product.id)}
								>
									{selectionMode && (
										<Box
											sx={{
												position: "absolute",
												top: 12,
												right: 12,
												zIndex: 1,
												color: isSelected ? "primary.main" : "rgba(0,0,0,0.45)",
											}}
										>
											<CheckCircleIcon fontSize="medium" />
										</Box>
									)}
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
											onClick={(event) => {
												event.stopPropagation();
												if (selectionMode) {
													return;
												}
												navigate(`/item/${product.id}`);
											}}
											disabled={selectionMode}
										>
											詳細へ
										</Button>
										<Button
											size="small"
											variant="outlined"
											onClick={(event) => {
												event.stopPropagation();
												if (selectionMode) {
													return;
												}
												navigate(`/edit/${product.id}`);
											}}
											disabled={selectionMode}
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
