// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/ItemFormPage.tsx

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	Box,
	Button,
	Card,
	CardActionArea,
	CardMedia,
	Checkbox,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	FormControlLabel,
	IconButton,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import axios from "axios";
import {
	ChangeEvent,
	DragEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import {
	getProductFilePreview,
	postProductReadme,
} from "../api/productFilesApi";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import { API_CONFIG } from "../constants/api";
import { useAuth } from "../context/AuthContext";
import productApi from "../services/productApi";
import "github-markdown-css/github-markdown-light.css";
import type { Category } from "../types/category";
import type { Product } from "../types/product";

const MAX_IMAGES = 5;
const README_FILE_ACCEPT = ".md,text/markdown,text/plain";
const DEFAULT_README = `# README\n\nこのプロジェクトの目的や特徴を簡潔にまとめてください。\n\n## 使い方\n\n- 機能を箇条書き\n- 使い方の説明\n\n## 準備\n\n- 環境や前提条件\n- インストール手順\n`;

interface EditFormState {
	name: string;
	description: string;
	categoryIds: number[];
	existingImageUrls: string[];
	newImageFiles: File[];
	newImagePreviews: string[];
	removeImageUrls: string[];
	googlePlayUrl: string;
	appStoreUrl: string;
	webAppUrl: string;
}

const toInitialState = (): EditFormState => ({
	name: "",
	description: "",
	categoryIds: [],
	existingImageUrls: [],
	newImageFiles: [],
	newImagePreviews: [],
	removeImageUrls: [],
	googlePlayUrl: "",
	appStoreUrl: "",
	webAppUrl: "",
});

const ItemFormPage = () => {
	const { itemId } = useParams<{ itemId?: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const { isLoggedIn } = useAuth();

	const [form, setForm] = useState<EditFormState>(toInitialState);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [loadingCategories, setLoadingCategories] = useState(true);
	const [loadingProduct, setLoadingProduct] = useState(Boolean(itemId));

	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [imageNotice, setImageNotice] = useState<string | null>(null);
	const [readme, setReadme] = useState("");
	const [isReadmeDragActive, setIsReadmeDragActive] = useState(false);
	const [readmeLoading, setReadmeLoading] = useState(false);

	const objectURLRef = useRef<string[]>([]);
	const readmeInputRef = useRef<HTMLInputElement | null>(null);
	const readmeTouchedRef = useRef(false);

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

				objectURLRef.current.forEach((url) => {
					URL.revokeObjectURL(url);
				});
				objectURLRef.current = [];

				setForm({
					name: data.name ?? "",
					description: (data.description as string | null) ?? "",
					categoryIds: (data.categoryIds ?? [])
						.map((value) => Number(value))
						.filter((value) => !Number.isNaN(value)),
					existingImageUrls: images,
					newImageFiles: [],
					newImagePreviews: [],
					removeImageUrls: [],
					googlePlayUrl: data.google_play_url ?? "",
					appStoreUrl: data.app_store_url ?? "",
					webAppUrl: data.web_app_url ?? "",
				});
				setActiveImageIndex(images.length > 0 ? 0 : 0);
				setImageNotice(null);
			} catch (fetchError) {
				console.error(fetchError);
				if (active) {
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

	useEffect(() => {
		if (!itemId) {
			setReadme("");
			readmeTouchedRef.current = false;
			setReadmeLoading(false);
			return;
		}

		let active = true;
		const fetchReadme = async () => {
			setReadmeLoading(true);
			try {
				const preview = await getProductFilePreview(
					Number(itemId),
					"README.md",
				);
				if (!active) {
					return;
				}
				setReadme(preview.content ?? "");
				readmeTouchedRef.current = false;
			} catch (previewError) {
				console.error(previewError);
				if (active) {
					setReadme("");
					readmeTouchedRef.current = false;
				}
			} finally {
				if (active) {
					setReadmeLoading(false);
				}
			}
		};

		fetchReadme();

		return () => {
			active = false;
		};
	}, [itemId]);

	const handleInputChange =
		(
			key:
				| "name"
				| "description"
				| "googlePlayUrl"
				| "appStoreUrl"
				| "webAppUrl",
		) =>
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
			const currentCount =
				prev.existingImageUrls.length + prev.newImagePreviews.length;
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

			const nextFiles = [...prev.newImageFiles, ...acceptedFiles];
			const nextPreviews = [...prev.newImagePreviews, ...newUrls];

			if (
				files.length > acceptedFiles.length ||
				prev.existingImageUrls.length + nextPreviews.length >= MAX_IMAGES
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
				newImageFiles: nextFiles,
				newImagePreviews: nextPreviews,
			};
		});

		event.target.value = "";
	};

	const handleRemoveImage = (index: number) => {
		setForm((prev) => {
			const totalExisting = prev.existingImageUrls.length;
			if (index < totalExisting) {
				const targetUrl = prev.existingImageUrls[index];
				return {
					...prev,
					existingImageUrls: prev.existingImageUrls.filter(
						(_, i) => i !== index,
					),
					removeImageUrls: [...prev.removeImageUrls, targetUrl],
				};
			}

			const newIndex = index - totalExisting;
			const targetPreview = prev.newImagePreviews[newIndex];
			if (targetPreview) {
				const refIndex = objectURLRef.current.indexOf(targetPreview);
				if (refIndex !== -1) {
					URL.revokeObjectURL(objectURLRef.current[refIndex]);
					objectURLRef.current.splice(refIndex, 1);
				}
			}

			return {
				...prev,
				newImageFiles: prev.newImageFiles.filter((_, i) => i !== newIndex),
				newImagePreviews: prev.newImagePreviews.filter(
					(_, i) => i !== newIndex,
				),
			};
		});
		setImageNotice(itemId ? "削除は保存すると反映されます" : null);
	};

	const markReadmeTouched = () => {
		if (!readmeTouchedRef.current) {
			readmeTouchedRef.current = true;
		}
	};

	const handleReadmeFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") {
				markReadmeTouched();
				setReadme(reader.result);
			}
		};
		reader.onerror = () => {
			console.error(reader.error);
		};
		reader.readAsText(file);
	};

	const handleReadmeFileInputChange = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			handleReadmeFile(file);
		}
		event.target.value = "";
	};

	const handleReadmeDragOver = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsReadmeDragActive(true);
	};

	const handleReadmeDragLeave = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsReadmeDragActive(false);
	};

	const handleReadmeDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsReadmeDragActive(false);
		const file = event.dataTransfer?.files?.[0];
		if (file) {
			handleReadmeFile(file);
		}
	};

	const combinedImages = useMemo(
		() => [...form.existingImageUrls, ...form.newImagePreviews],
		[form.existingImageUrls, form.newImagePreviews],
	);

	useEffect(() => {
		setActiveImageIndex((prev) => {
			if (combinedImages.length === 0) {
				return 0;
			}
			const maxIndex = combinedImages.length - 1;
			return Math.min(prev, maxIndex);
		});
	}, [combinedImages]);

	const canSubmit = useMemo(() => {
		return form.name.trim().length > 0 && form.categoryIds.length > 0;
	}, [form.name, form.categoryIds.length]);

	const readmePreviewContent = useMemo(() => {
		return readme.trim().length > 0 ? readme : DEFAULT_README;
	}, [readme]);

	const handleSubmit = async () => {
		if (!canSubmit || submitting) {
			return;
		}

		setSubmitting(true);

		try {
			const savedProduct = itemId
				? await productApi.updateProduct(Number(itemId), {
						name: form.name,
						description: form.description,
						categoryIds: form.categoryIds,
						image_url: form.newImageFiles.length
							? form.newImageFiles
							: undefined,
						remove_image_urls: form.removeImageUrls.length
							? form.removeImageUrls
							: undefined,
						google_play_url: form.googlePlayUrl || undefined,
						app_store_url: form.appStoreUrl || undefined,
						web_app_url: form.webAppUrl || undefined,
					})
				: await productApi.createProduct({
						name: form.name,
						description: form.description,
						categoryIds: form.categoryIds,
						image_url: form.newImageFiles,
						google_play_url: form.googlePlayUrl || undefined,
						app_store_url: form.appStoreUrl || undefined,
						web_app_url: form.webAppUrl || undefined,
					});

			if (readmeTouchedRef.current) {
				try {
					await postProductReadme(savedProduct.id, readme);
				} catch (readmeError) {
					console.error(readmeError);
					return;
				}
			}

			navigate("/my-products", { replace: true });
		} catch (submitError) {
			console.error(submitError);
			if (axios.isAxiosError(submitError) && submitError.response) {
				if (
					submitError.response.data &&
					typeof submitError.response.data.message === "string"
				) {
					// No setError call
				} else {
					// No setError call
				}
			} else {
				// No setError call
			}
			if (
				axios.isAxiosError(submitError) &&
				submitError.response &&
				submitError.response.data &&
				typeof submitError.response.data.message === "string"
			) {
			}
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
	};

	const handleDeleteConfirm = async () => {
		if (!itemId || deleting) {
			return;
		}

		setDeleting(true);

		try {
			await productApi.deleteProduct(Number(itemId));
			setDeleteDialogOpen(false);
			navigate("/my-products", { replace: true });
		} catch (deleteError) {
			console.error(deleteError);
			setDeleteDialogOpen(false);
		} finally {
			setDeleting(false);
		}
	};

	const activePreview = combinedImages[activeImageIndex] ?? null;

	return (
		<div className="item-form-page">
			<AppHeaderWithAuth />
			<Container
				maxWidth="lg"
				sx={{ py: 4, mt: { xs: 8, md: 10 } }} // ヘッダーが被らないよう余白を確保
			>
				<Stack spacing={3}>
					<Typography variant="h4" fontWeight="bold">
						{itemId ? "作品を編集" : "新しい作品を投稿"}
					</Typography>

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
											{combinedImages.length}/{MAX_IMAGES} 枚
										</Typography>
									</Box>
									<Button
										variant="outlined"
										component="label"
										disabled={combinedImages.length >= MAX_IMAGES}
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
									) : combinedImages.length > 0 ? (
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
											{combinedImages.map((src, index) => (
												<Box
													key={`${src}-${index}`}
													sx={{ position: "relative" }}
												>
													<CardActionArea
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
													<IconButton
														size="small"
														aria-label="画像を削除"
														onClick={(event) => {
															event.stopPropagation();
															handleRemoveImage(index);
														}}
														sx={{
															position: "absolute",
															top: 4,
															right: 4,
															backgroundColor: "rgba(0, 0, 0, 0.45)",
															color: "common.white",
															"&:hover": {
																backgroundColor: "rgba(0, 0, 0, 0.65)",
															},
														}}
													>
														<CloseIcon fontSize="small" />
													</IconButton>
												</Box>
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
								<Stack spacing={2}>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											gap: 2,
										}}
									>
										<Typography variant="h6">README.md</Typography>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
											<Button
												variant="text"
												onClick={() => readmeInputRef.current?.click()}
											>
												ファイル選択
											</Button>
											<Typography variant="caption" color="text.secondary">
												README.md をドラッグ＆ドロップで読み込めます
											</Typography>
										</Box>
									</Box>
									<input
										type="file"
										ref={readmeInputRef}
										accept={README_FILE_ACCEPT}
										onChange={handleReadmeFileInputChange}
										hidden
									/>
									<Box
										sx={{
											display: "grid",
											gap: 2,
											gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
										}}
									>
										<Box
											component="div"
											onDrop={handleReadmeDrop}
											onDragOver={handleReadmeDragOver}
											onDragLeave={handleReadmeDragLeave}
											sx={{
												borderRadius: 2,
												border: "1px dashed",
												borderColor: isReadmeDragActive
													? "primary.main"
													: "divider",
												px: 1.25,
												py: 0.75,
												minHeight: 280,
												transition: "border-color 0.2s ease",
											}}
										>
											<Typography variant="caption" color="text.secondary">
												直接編集・貼り付けで Markdown を更新できます
											</Typography>
											<TextField
												label="README (Markdown)"
												value={readme}
												onChange={(event) => {
													markReadmeTouched();
													setReadme(event.target.value);
												}}
												multiline
												minRows={10}
												fullWidth
												placeholder={DEFAULT_README}
												name="readme"
												inputProps={{ spellCheck: "false" }}
											/>
										</Box>
										<Box
											component="div"
											sx={{
												borderRadius: 2,
												border: "1px solid",
												borderColor: "divider",
												p: 2,
												minHeight: 280,
											}}
										>
											<Typography variant="subtitle2" color="text.secondary">
												プレビュー
											</Typography>
											<Divider sx={{ my: 1 }} />
											<Box
												className="markdown-body"
												sx={{
													minHeight: 220,
													overflow: "auto",
													backgroundColor: "common.white",
													borderRadius: 1,
													p: 2,
												}}
											>
												{readmeLoading ? (
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<CircularProgress size={20} />
														<Typography variant="body2" color="text.secondary">
															README を読み込み中です
														</Typography>
													</Box>
												) : (
													<ReactMarkdown remarkPlugins={[remarkGfm]}>
														{readmePreviewContent}
													</ReactMarkdown>
												)}
											</Box>
										</Box>
									</Box>
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
									アプリリンク（任意）
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 2 }}
								>
									ユーザーがアプリにアクセスできるリンクを設定してください
								</Typography>
								<Stack spacing={2}>
									<TextField
										label="Google Play Store URL"
										value={form.googlePlayUrl}
										onChange={handleInputChange("googlePlayUrl")}
										placeholder="https://play.google.com/store/apps/details?id=..."
										fullWidth
										type="url"
									/>
									<TextField
										label="App Store URL"
										value={form.appStoreUrl}
										onChange={handleInputChange("appStoreUrl")}
										placeholder="https://apps.apple.com/app/..."
										fullWidth
										type="url"
									/>
									<TextField
										label="Webアプリ URL"
										value={form.webAppUrl}
										onChange={handleInputChange("webAppUrl")}
										placeholder="https://example.com"
										fullWidth
										type="url"
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
								{itemId && (
									<Button
										variant="outlined"
										color="error"
										disabled={submitting || deleting}
										onClick={handleDeleteClick}
										startIcon={<DeleteIcon />}
									>
										削除
									</Button>
								)}
								<Button
									variant="outlined"
									disabled={submitting || deleting}
									onClick={() => navigate(-1)}
								>
									キャンセル
								</Button>
								<Button
									variant="contained"
									disabled={!canSubmit || submitting || deleting}
									onClick={handleSubmit}
								>
									{submitting ? "送信中..." : itemId ? "更新する" : "投稿する"}
								</Button>
							</Stack>
						</Stack>
					</Box>
				</Stack>
			</Container>

			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				aria-labelledby="delete-dialog-title"
				aria-describedby="delete-dialog-description"
			>
				<DialogTitle id="delete-dialog-title">作品を削除しますか？</DialogTitle>
				<DialogContent>
					<DialogContentText id="delete-dialog-description">
						この操作は取り消すことができません。作品「{form.name}
						」を完全に削除してもよろしいですか？
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} disabled={deleting}>
						キャンセル
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
						disabled={deleting}
					>
						{deleting ? "削除中..." : "削除する"}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ItemFormPage;
