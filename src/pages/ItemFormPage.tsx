// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/ItemFormPage.tsx
import {
	Box,
	Button,
	Card,
	CardContent,
	CardMedia,
	Checkbox,
	CircularProgress,
	Container,
	FormControlLabel,
	TextField,
	Typography,
} from "@mui/material";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import { API_CONFIG } from "../constants/api";
import { useAuth } from "../context/AuthContext";
import productApi from "../services/productApi";
import type { Category } from "../types/category";
import type { Product } from "../types/product";

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

	useEffect(() => {
		return () => {
			form.imagePreviews.forEach((preview) => {
				if (preview.startsWith("blob:")) {
					URL.revokeObjectURL(preview);
				}
			});
		};
	}, [form.imagePreviews]);

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
				if (active) setError("カテゴリの取得に失敗しました");
			} finally {
				if (active) setLoadingCategories(false);
			}
		};

		fetchCategories();
		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!itemId) return;
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
				if (!active) return;
				const images = Array.isArray(data.image_url)
					? data.image_url.filter(
							(url): url is string => typeof url === "string",
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
			} catch (fetchError) {
				console.error(fetchError);
				if (active) setError("プロダクトの取得に失敗しました");
			} finally {
				if (active) setLoadingProduct(false);
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
		setForm((prev) => ({
			...prev,
			imageFiles: files,
			imagePreviews: files.map((file) => URL.createObjectURL(file)),
		}));
	};

	const canSubmit = useMemo(() => {
		return form.name.trim().length > 0 && form.categoryIds.length > 0;
	}, [form.name, form.categoryIds.length]);

	const handleSubmit = async () => {
		if (!canSubmit || submitting) return;
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

	if (!isLoggedIn) {
		return null;
	}

	return (
		<div className="item-form-page">
			<AppHeaderWithAuth activePath={itemId ? `/edit/${itemId}` : "/create"} />
			<Container maxWidth="md" sx={{ py: 4, mt: 6 }}>
				<Typography variant="h4" gutterBottom>
					{itemId ? "作品を編集" : "新しい作品を投稿"}
				</Typography>

				{error && (
					<Box sx={{ mb: 2 }}>
						<Typography color="error" variant="body2">
							{error}
						</Typography>
					</Box>
				)}

				<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
						minRows={4}
						fullWidth
					/>

					<Box>
						<Typography variant="h6" sx={{ mb: 1 }}>
							カテゴリ
						</Typography>
						{loadingCategories ? (
							<CircularProgress size={24} />
						) : (
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: {
										xs: "1fr",
										sm: "repeat(2, minmax(0, 1fr))",
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
					</Box>

					<Box>
						<Typography variant="h6" sx={{ mb: 1 }}>
							作品画像 (最大5枚)
						</Typography>
						<Button variant="outlined" component="label">
							画像を選択
							<input
								type="file"
								accept="image/*"
								multiple
								onChange={handleImageChange}
								hidden
							/>
						</Button>

						{(form.imagePreviews.length > 0 || loadingProduct) && (
							<Box sx={{ mt: 1 }}>
								{loadingProduct ? (
									<CircularProgress size={24} />
								) : (
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: {
												xs: "repeat(2, minmax(0, 1fr))",
												sm: "repeat(3, minmax(0, 1fr))",
											},
											gap: 2,
										}}
									>
										{form.imagePreviews.map((src, index) => (
											<Card key={src + index}>
												<CardMedia
													component="img"
													height="140"
													image={src}
													alt={`preview-${index}`}
												/>
												<CardContent>
													<Typography variant="body2" color="text.secondary">
														プレビュー {index + 1}
													</Typography>
												</CardContent>
											</Card>
										))}
									</Box>
								)}
							</Box>
						)}
					</Box>

					<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
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
					</Box>
				</Box>
			</Container>
		</div>
	);
};

export default ItemFormPage;
