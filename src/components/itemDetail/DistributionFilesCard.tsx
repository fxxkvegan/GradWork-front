import {
	CloudDownload as CloudDownloadIcon,
	Description as DescriptionIcon,
	Folder as FolderIcon,
	Visibility as VisibilityIcon,
	WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Paper,
	Snackbar,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
	FilePreviewResponse,
	ProductFileItem,
} from "../../api/productFilesApi";
import {
	getProductFilePreview,
	getProductFilesTree,
	postProductFileDownloadIntent,
} from "../../api/productFilesApi";

type Props = {
	productId: number | null;
	fileStatus?: "none" | "pending" | "approved" | string;
	isDemoMode?: boolean;
};

const formatFileSize = (value?: number | null): string => {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return "-";
	}
	if (value < 1024) {
		return `${value} B`;
	}
	const units = ["KB", "MB", "GB"] as const;
	let size = value / 1024;
	let unitIndex = 0;
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex += 1;
	}
	return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

export default function DistributionFilesCard({
	productId,
	fileStatus = "none",
	isDemoMode = false,
}: Props) {
	const [loadingTree, setLoadingTree] = useState(false);
	const [files, setFiles] = useState<ProductFileItem[]>([]);
	const [totalFiles, setTotalFiles] = useState<number | null>(null);
	const [totalSize, setTotalSize] = useState<number | null>(null);
	const [treeError, setTreeError] = useState<string | null>(null);

	const [selectedPath, setSelectedPath] = useState<string | null>(null);
	const [preview, setPreview] = useState<FilePreviewResponse | null>(null);
	const [previewError, setPreviewError] = useState<string | null>(null);
	const [loadingPreview, setLoadingPreview] = useState(false);

	const [downloadModalOpen, setDownloadModalOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

	const isDownloadAllowed = fileStatus === "approved";

	const fileStatusChip = useMemo(() => {
		if (fileStatus === "approved") {
			return <Chip size="small" color="success" label="🟢 承認済み（DL可）" />;
		}
		if (fileStatus === "pending") {
			return <Chip size="small" color="warning" label="🟡 確認中（DL制限）" />;
		}
		if (fileStatus === "none") {
			return null;
		}
		return <Chip size="small" color="default" label={String(fileStatus)} />;
	}, [fileStatus]);

	const sortedFiles = useMemo(
		() => [...files].sort((a, b) => a.path.localeCompare(b.path)),
		[files],
	);

	const selectedItem = useMemo(() => {
		if (!selectedPath) {
			return null;
		}
		return sortedFiles.find((f) => f.path === selectedPath) ?? null;
	}, [selectedPath, sortedFiles]);

	const loadTree = useCallback(async () => {
		if (isDemoMode || !productId) {
			setFiles([]);
			setTotalFiles(null);
			setTotalSize(null);
			setTreeError(
				isDemoMode ? "デモモードでは配布ファイルを表示できません" : null,
			);
			return;
		}

		setLoadingTree(true);
		setTreeError(null);
		try {
			const data = await getProductFilesTree(productId);
			const nextFiles = Array.isArray(data.files) ? data.files : [];
			setFiles(nextFiles);
			setTotalFiles(
				typeof data.total_files === "number"
					? data.total_files
					: nextFiles.length,
			);
			setTotalSize(
				typeof data.total_size === "number" ? data.total_size : null,
			);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				setTreeError("配布ファイルが見つかりませんでした");
			} else {
				setTreeError("配布ファイルの取得に失敗しました");
			}
			setFiles([]);
			setTotalFiles(null);
			setTotalSize(null);
		} finally {
			setLoadingTree(false);
		}
	}, [isDemoMode, productId]);

	useEffect(() => {
		setSelectedPath(null);
		setPreview(null);
		setPreviewError(null);
		void loadTree();
	}, [loadTree]);

	const fetchPreview = useCallback(
		async (path: string) => {
			if (isDemoMode || !productId) {
				return;
			}
			setLoadingPreview(true);
			setPreviewError(null);
			try {
				const data = await getProductFilePreview(productId, path);
				setPreview(data);
			} catch {
				setPreview(null);
				setPreviewError("プレビューの取得に失敗しました");
			} finally {
				setLoadingPreview(false);
			}
		},
		[isDemoMode, productId],
	);

	const handleSelect = (item: ProductFileItem) => {
		if (item.type === "dir") {
			return;
		}
		setSelectedPath(item.path);
		setPreview(null);
		setPreviewError(null);
		if (item.is_previewable) {
			void fetchPreview(item.path);
		}
	};

	const handleOpenDownload = () => {
		if (!selectedPath) {
			return;
		}
		setDownloadModalOpen(true);
	};

	const handleConfirmDownload = async () => {
		if (isDemoMode || !productId || !selectedPath) {
			setDownloadModalOpen(false);
			return;
		}
		try {
			await postProductFileDownloadIntent(productId, selectedPath);
			setSnackbarMessage("ダウンロード準備を開始しました（仮）");
		} catch {
			setSnackbarMessage("ダウンロードの開始に失敗しました");
		} finally {
			setDownloadModalOpen(false);
		}
	};

	return (
		<Card>
			<CardHeader
				title="配布ファイル"
				action={
					<Stack direction="row" spacing={1} alignItems="center">
						{fileStatusChip}
						<Typography variant="caption" color="text.secondary">
							Total: {(totalFiles ?? sortedFiles.length).toLocaleString()}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Size: {formatFileSize(totalSize)}
						</Typography>
					</Stack>
				}
			/>
			<Divider />
			<CardContent>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
						gap: 2,
					}}
				>
					<Paper variant="outlined" sx={{ maxHeight: 360, overflow: "auto" }}>
						{treeError && !loadingTree ? (
							<Stack spacing={1} sx={{ p: 2 }}>
								<Typography variant="body2" color="text.secondary">
									{treeError}
								</Typography>
								{!isDemoMode ? (
									<Box>
										<Button size="small" onClick={() => loadTree()}>
											再試行
										</Button>
									</Box>
								) : null}
							</Stack>
						) : loadingTree ? (
							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									minHeight: 360,
								}}
							>
								<CircularProgress size={24} />
							</Box>
						) : sortedFiles.length === 0 ? (
							<Box sx={{ p: 2 }}>
								<Typography variant="body2" color="text.secondary">
									配布ファイルは登録されていません。
								</Typography>
							</Box>
						) : (
							<List dense disablePadding>
								{sortedFiles.map((item) => {
									const fileName = item.path.split("/").pop() || item.path;
									const secondary = `${formatFileSize(item.size)} ・ ${
										item.is_previewable ? "プレビュー可" : "プレビュー不可"
									}`;
									return (
										<ListItemButton
											key={item.path}
											selected={selectedPath === item.path}
											disabled={item.type === "dir"}
											onClick={() => handleSelect(item)}
										>
											<ListItemIcon sx={{ minWidth: 32 }}>
												{item.type === "dir" ? (
													<FolderIcon fontSize="small" color="action" />
												) : (
													<DescriptionIcon fontSize="small" color="action" />
												)}
											</ListItemIcon>
											<ListItemText primary={fileName} secondary={secondary} />
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 1 }}
											>
												{item.is_previewable ? (
													<Tooltip title="プレビュー可能">
														<VisibilityIcon fontSize="small" color="action" />
													</Tooltip>
												) : (
													<Tooltip title="プレビューできません">
														<WarningAmberIcon
															fontSize="small"
															color="disabled"
														/>
													</Tooltip>
												)}
											</Box>
										</ListItemButton>
									);
								})}
							</List>
						)}
					</Paper>

					<Paper variant="outlined" sx={{ p: 2, minHeight: 360 }}>
						<Stack spacing={1.25}>
							<Stack
								direction={{ xs: "column", sm: "row" }}
								alignItems={{ xs: "flex-start", sm: "center" }}
								justifyContent="space-between"
								spacing={{ xs: 1, sm: 2 }}
							>
								<Typography variant="subtitle2" color="text.secondary">
									{selectedPath ?? "左からファイルを選択してください"}
								</Typography>
								<Button
									variant="contained"
									size="small"
									startIcon={<CloudDownloadIcon />}
									disabled={!selectedPath || !isDownloadAllowed}
									onClick={handleOpenDownload}
								>
									ダウンロード
								</Button>
							</Stack>

							{fileStatus === "pending" ? (
								<Box
									sx={{
										bgcolor: "warning.light",
										p: 1.25,
										borderRadius: 1,
									}}
								>
									<Typography variant="body2">
										DL制限中（承認後にダウンロード可能になります）
									</Typography>
								</Box>
							) : null}

							<Box>
								{loadingPreview ? (
									<Typography variant="body2" color="text.secondary">
										読み込み中…
									</Typography>
								) : !selectedPath ? (
									<Typography variant="body2" color="text.secondary">
										左からファイルを選択してください
									</Typography>
								) : previewError ? (
									<Typography variant="body2" color="error">
										{previewError}
									</Typography>
								) : selectedItem && !selectedItem.is_previewable ? (
									<Typography variant="body2" color="text.secondary">
										この形式はプレビューできません
									</Typography>
								) : preview ? (
									<Box
										component="pre"
										sx={{
											whiteSpace: "pre-wrap",
											wordBreak: "break-word",
											m: 0,
										}}
									>
										{preview.content}
									</Box>
								) : (
									<Typography variant="body2" color="text.secondary">
										プレビューを表示できません
									</Typography>
								)}
							</Box>
						</Stack>
					</Paper>
				</Box>
			</CardContent>

			<Dialog
				open={downloadModalOpen}
				onClose={() => setDownloadModalOpen(false)}
			>
				<DialogTitle>ダウンロードの確認</DialogTitle>
				<DialogContent>
					<DialogContentText>
						選択したファイルをダウンロードしますか？
					</DialogContentText>
					{selectedPath && (
						<Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
							{selectedPath}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDownloadModalOpen(false)}>
						キャンセル
					</Button>
					<Button variant="contained" onClick={handleConfirmDownload}>
						ダウンロード
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={Boolean(snackbarMessage)}
				autoHideDuration={3000}
				onClose={() => setSnackbarMessage(null)}
				message={snackbarMessage ?? ""}
			/>
		</Card>
	);
}
