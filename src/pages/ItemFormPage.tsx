// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/ItemFormPage.tsx
import {
	Alert,
	Box,
	Button,
	Card,
	CardActionArea,
	CardMedia,
	Checkbox,
	CircularProgress,
	Container,
	Divider,
	FormControlLabel,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import { API_CONFIG } from "../constants/api";
import { useAuth } from "../context/AuthContext";
import productApi from "../services/productApi";
import type { Category } from "../types/category";
import type { Product } from "../types/product";

const MAX_IMAGES = 5;

interface EditFormState {
	name: string;
	description: string;
	categoryIds: number[];
	imageFiles: File[];
	imagePreviews: string[];
}

const toInitialState = (): EditFormState => ({
	name: "",
	description: "",
	categoryIds: [],
	imageFiles: [],
	imagePreviews: [],
});

const ItemFormPage = () => {
	const { itemId } = useParams<{ itemId?: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const { isLoggedIn } = useAuth();

	const [form, setForm] = useState<EditFormState>(toInitialState);
	const [submitting, setSubmitting] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [loadingCategories, setLoadingCategories] = useState(true);
	const [loadingProduct, setLoadingProduct] = useState(Boolean(itemId));
	const [error, setError] = useState<string | null>(null);
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [imageNotice, setImageNotice] = useState<string | null>(null);

	const objectURLRef = useRef<string[]>([]);

	useEffect(() => {
		return () => {
			objectURLRef.current.forEach((url) => {
				URL.revokeObjectURL(url);
			});
		};
	}, []);

	useEffect(() => {
		if (!isLoggedIn) {
			navigate("/login", { replace: true, state: { from: location.pathname } });
		}
	}, [isLoggedIn, navigate, location.pathname]);

	useEffect(() => {
		let active = true;
		const fetchCategories = async () => {
			try {
				setLoadingCategories(true);
				const res = await fetch(`${API_CONFIG.BASE_URL}/categories`);
				if (!res.ok) {
					throw new Error(`カテゴリ取得に失敗しました (status: ${res.status})`);
				}
				const json: { items?: Category[] } = await res.json();
				if (active) {
					setCategories(Array.isArray(json.items) ? json.items : []);
				}
			} catch (fetchError) {
				console.error(fetchError);
				if (active) {
					setError("カテゴリの取得に失敗しました");
				}
			} finally {
				if (active) {
					setLoadingCategories(false);
				}
			}
		};

		fetchCategories();
		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!itemId) {
			return;
		}

		let active = true;
		const fetchProduct = async () => {
			try {
				setLoadingProduct(true);
				const res = await fetch(`${API_CONFIG.BASE_URL}/products/${itemId}`);
				if (!res.ok) {
					throw new Error(
						`プロダクト取得に失敗しました (status: ${res.status})`,
					);
				}
				const data: Product = await res.json();
				if (!active) {
					return;
				}

				const images = Array.isArray(data.image_url)
					? data.image_url.filter(
							(url): url is string => typeof url === "string" && url !== "",
						)
					: typeof data.image_url === "string" && data.image_url !== ""
						? [data.image_url]
						: [];

				setForm({
					name: data.name ?? "",
					description: (data.description as string | null) ?? "",
					categoryIds: (data.categoryIds ?? [])
						.map((value) => Number(value))
						.filter((value) => !Number.isNaN(value)),
					imageFiles: [],
					imagePreviews: images,
				});
				setActiveImageIndex(images.length > 0 ? 0 : 0);
				setImageNotice(null);
			} catch (fetchError) {
				console.error(fetchError);
				if (active) {
					setError("プロダクトの取得に失敗しました");
				}
			} finally {
				if (active) {
					setLoadingProduct(false);
				}
			}
		};

		fetchProduct();
		return () => {
			active = false;
		};
	}, [itemId]);

	const handleInputChange =
		(key: "name" | "description") =>
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			setForm((prev) => ({ ...prev, [key]: event.target.value }));
		};

	const toggleCategory = (categoryId: number) => () => {
		setForm((prev) => {
			const exists = prev.categoryIds.includes(categoryId);
			return {
				...prev,
				categoryIds: exists
					? prev.categoryIds.filter((id) => id !== categoryId)
					: [...prev.categoryIds, categoryId],
			};
		});
	};

	const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files ? Array.from(event.target.files) : [];
		if (files.length === 0) {
			return;
		}

		setForm((prev) => {
			const currentCount = prev.imagePreviews.length;
			const availableSlots = MAX_IMAGES - currentCount;

			if (availableSlots <= 0) {
				setImageNotice(`画像は最大${MAX_IMAGES}枚まで追加できます。`);
				return prev;
			}

			const acceptedFiles = files.slice(0, availableSlots);
			if (acceptedFiles.length === 0) {
				setImageNotice(`画像は最大${MAX_IMAGES}枚まで追加できます。`);
				return prev;
			}

			const newUrls = acceptedFiles.map((file) => {
				const url = URL.createObjectURL(file);
				objectURLRef.current.push(url);
				return url;
			});

			const nextFiles = [...prev.imageFiles, ...acceptedFiles];
			const nextPreviews = [...prev.imagePreviews, ...newUrls];

			if (
				files.length > acceptedFiles.length ||
				nextPreviews.length >= MAX_IMAGES
			) {
				setImageNotice(`画像は最大${MAX_IMAGES}枚まで追加できます。`);
			} else {
				setImageNotice(null);
			}

			const nextActiveIndex =
				currentCount === 0 ? 0 : currentCount + acceptedFiles.length - 1;
			setActiveImageIndex(nextActiveIndex);

			return {
				...prev,
				imageFiles: nextFiles,
				imagePreviews: nextPreviews,
			};
		});

		event.target.value = "";
	};

	useEffect(() => {
		setActiveImageIndex((prev) => {
			if (form.imagePreviews.length === 0) {
				return 0;
			}
			const maxIndex = form.imagePreviews.length - 1;
			return Math.min(prev, maxIndex);
		});
	}, [form.imagePreviews]);

	const canSubmit = useMemo(() => {
		return form.name.trim().length > 0 && form.categoryIds.length > 0;
	}, [form.name, form.categoryIds.length]);

	const handleSubmit = async () => {
		if (!canSubmit || submitting) {
			return;
		}

		setSubmitting(true);
		setError(null);

		try {
			if (itemId) {
				await productApi.updateProduct(Number(itemId), {
					name: form.name,
					description: form.description,
					categoryIds: form.categoryIds,
					image_url: form.imageFiles.length ? form.imageFiles : undefined,
				});
			} else {
				await productApi.createProduct({
					name: form.name,
					description: form.description,
					categoryIds: form.categoryIds,
					image_url: form.imageFiles,
				});
			}
			navigate("/my-products", { replace: true });
		} catch (submitError) {
			console.error(submitError);
			setError(
				itemId ? "作品の更新に失敗しました" : "作品の投稿に失敗しました",
			);
		} finally {
			setSubmitting(false);
		}
	};

	const activePreview = form.imagePreviews[activeImageIndex] ?? null;

	return (
		<div className="item-form-page">
			<AppHeaderWithAuth />
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Stack spacing={3}>
					<Typography variant="h4" fontWeight="bold">
						{itemId ? "作品を編集" : "新しい作品を投稿"}
					</Typography>
					{error && <Alert severity="error">{error}</Alert>}
					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", lg: "row" },
							gap: 3,
						}}
					>
						<Stack spacing={3} sx={{ flex: 1 }}>
							<Paper
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									minHeight: 320,
									backgroundColor: "grey.50",
									overflow: "hidden",
								}}
							>
								{activePreview ? (
									<Box
										component="img"
										src={activePreview}
										alt="active-preview"
										sx={{ width: "100%", height: "100%", objectFit: "cover" }}
									/>
								) : loadingProduct ? (
									<CircularProgress />
								) : (
									<Box sx={{ textAlign: "center", color: "text.secondary" }}>
										<Typography variant="body1">
											ここにプレビューが表示されます
										</Typography>
										<Typography variant="caption">
											画像を追加すると大きなプレビューが表示されます
										</Typography>
									</Box>
								)}
							</Paper>

							<Paper sx={{ p: 3 }}>
								<Stack spacing={1.5}>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<Typography variant="h6">
											作品画像 (最大{MAX_IMAGES}枚)
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{form.imagePreviews.length}/{MAX_IMAGES} 枚
										</Typography>
									</Box>
									<Button
										variant="outlined"
										component="label"
										disabled={form.imagePreviews.length >= MAX_IMAGES}
									>
										画像を選択
										<input
											type="file"
											accept="image/*"
											multiple
											onChange={handleImageChange}
											hidden
										/>
									</Button>
									{imageNotice && (
										<Typography variant="caption" color="error.main">
											{imageNotice}
										</Typography>
									)}
									{loadingProduct ? (
										<Box
											sx={{ display: "flex", justifyContent: "center", py: 2 }}
										>
											<CircularProgress size={24} />
										</Box>
									) : form.imagePreviews.length > 0 ? (
										<Box
											sx={{
												display: "grid",
												gap: 1.5,
												gridTemplateColumns: {
													xs: "repeat(auto-fill, minmax(96px, 1fr))",
													sm: "repeat(auto-fill, minmax(110px, 1fr))",
												},
											}}
										>
											{form.imagePreviews.map((src, index) => (
												<CardActionArea
													key={`${src}-${index}`}
													onClick={() => setActiveImageIndex(index)}
												>
													<Card
														sx={{
															border:
																index === activeImageIndex
																	? "2px solid"
																	: "1px solid",
															borderColor:
																index === activeImageIndex
																	? "primary.main"
																	: "grey.200",
														}}
													>
														<CardMedia
															component="img"
															height="90"
															image={src}
															alt={`preview-${index}`}
															loading="lazy"
														/>
													</Card>
												</CardActionArea>
											))}
										</Box>
									) : (
										<Typography variant="body2" color="text.secondary">
											画像を追加するとここに一覧表示されます。
										</Typography>
									)}
								</Stack>
							</Paper>

							<Paper sx={{ p: 3 }}>
								<Typography variant="h6" gutterBottom>
									公開時の表示イメージ
								</Typography>
								<Stack spacing={1.5}>
									<Typography variant="h5" fontWeight="bold">
										{form.name.trim() || "作品名がここに表示されます"}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{form.description.trim() ||
											"作品説明を入力するとここに表示されます"}
									</Typography>
									<Divider sx={{ my: 1 }} />
									<Typography variant="subtitle2" color="text.secondary">
										選択中のカテゴリ
									</Typography>
									<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
										{form.categoryIds.length > 0 ? (
											form.categoryIds.map((id) => {
												const category = categories.find(
													(item) => item.id === id,
												);
												return (
													<Typography
														key={id}
														variant="body2"
														sx={{
															px: 1.5,
															py: 0.5,
															borderRadius: 1,
															backgroundColor: "grey.100",
														}}
													>
														{category?.name ?? `カテゴリID: ${id}`}
													</Typography>
												);
											})
										) : (
											<Typography variant="body2" color="text.secondary">
												カテゴリを選択するとここに表示されます
											</Typography>
										)}
									</Box>
								</Stack>
							</Paper>
						</Stack>

						<Stack
							spacing={3}
							sx={{
								flexBasis: { xs: "100%", lg: 360 },
								flexGrow: { xs: 1, lg: 0 },
							}}
						>
							<Paper sx={{ p: 3 }}>
								<Stack spacing={2}>
									<TextField
										label="作品名"
										value={form.name}
										onChange={handleInputChange("name")}
										required
										fullWidth
									/>
									<TextField
										label="作品説明"
										value={form.description}
										onChange={handleInputChange("description")}
										multiline
										minRows={6}
										fullWidth
									/>
								</Stack>
							</Paper>

							<Paper sx={{ p: 3 }}>
								<Typography variant="h6" gutterBottom>
									カテゴリ選択
								</Typography>
								{loadingCategories ? (
									<CircularProgress size={24} />
								) : (
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: {
												xs: "repeat(1, minmax(0, 1fr))",
												sm: "repeat(2, minmax(0, 1fr))",
												md: "repeat(1, minmax(0, 1fr))",
											},
											gap: 1,
										}}
									>
										{categories.map((category) => (
											<Box key={category.id}>
												<FormControlLabel
													control={
														<Checkbox
															checked={form.categoryIds.includes(category.id)}
															onChange={toggleCategory(category.id)}
														/>
													}
													label={category.name}
												/>
											</Box>
										))}
									</Box>
								)}
							</Paper>

							<Stack direction="row" spacing={2} justifyContent="flex-end">
								<Button
									variant="outlined"
									disabled={submitting}
									onClick={() => navigate(-1)}
								>
									キャンセル
								</Button>
								<Button
									variant="contained"
									disabled={!canSubmit || submitting}
									onClick={handleSubmit}
								>
									{submitting ? "送信中..." : itemId ? "更新する" : "投稿する"}
								</Button>
							</Stack>
						</Stack>
					</Box>
				</Stack>
			</Container>
		</div>
	);
};

export default ItemFormPage;
