import { PhotoCamera, RestartAlt } from "@mui/icons-material";
import {
	Alert,
	Avatar,
	Box,
	Button,
	Container,
	Divider,
	Grid,
	Link,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import { useAuth } from "../context/AuthContext";
import userApi from "../services/userApi";
import type { UserProfile } from "../types/user";

interface ProfileFormState {
	name: string;
	displayName: string;
	email: string;
	bio: string;
	location: string;
	website: string;
	birthday: string;
	locale: string;
	theme: string;
	avatarUrl: string;
	avatarPreviewUrl: string | null;
	avatarFile: File | null;
	headerUrl: string;
	headerPreviewUrl: string | null;
	headerFile: File | null;
}

type TextFieldKey =
	| "name"
	| "displayName"
	| "email"
	| "bio"
	| "location"
	| "website"
	| "birthday"
	| "locale"
	| "theme";

const TEXT_FIELD_KEYS: TextFieldKey[] = [
	"name",
	"displayName",
	"email",
	"bio",
	"location",
	"website",
	"birthday",
	"locale",
	"theme",
];

const EMPTY_FORM: ProfileFormState = {
	name: "",
	displayName: "",
	email: "",
	bio: "",
	location: "",
	website: "",
	birthday: "",
	locale: "ja",
	theme: "light",
	avatarUrl: "",
	avatarPreviewUrl: null,
	avatarFile: null,
	headerUrl: "",
	headerPreviewUrl: null,
	headerFile: null,
};

const toDateInputValue = (value: string | null | undefined): string => {
	if (!value) {
		return "";
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "";
	}
	return date.toISOString().slice(0, 10);
};

const mapProfileToForm = (profile: UserProfile | null): ProfileFormState => ({
	name: profile?.name ?? "",
	displayName: profile?.displayName ?? "",
	email: profile?.email ?? "",
	bio: profile?.bio ?? "",
	location: profile?.location ?? "",
	website: profile?.website ?? "",
	birthday: toDateInputValue(profile?.birthday ?? null),
	locale: profile?.locale ?? "ja",
	theme: profile?.theme ?? "light",
	avatarUrl: profile?.avatarUrl ?? "",
	avatarPreviewUrl: profile?.avatarUrl ?? null,
	avatarFile: null,
	headerUrl: profile?.headerUrl ?? "",
	headerPreviewUrl: profile?.headerUrl ?? null,
	headerFile: null,
});

export default function SettingsPage() {
	const { isLoggedIn, updateUser, user } = useAuth();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
	const [initialForm, setInitialForm] = useState<ProfileFormState>(EMPTY_FORM);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const avatarObjectUrlRef = useRef<string | null>(null);
	const headerObjectUrlRef = useRef<string | null>(null);
	const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
	const headerFileInputRef = useRef<HTMLInputElement | null>(null);

	const isAvatarDirty = useMemo(() => {
		return (
			form.avatarFile !== null ||
			form.avatarPreviewUrl !== initialForm.avatarPreviewUrl ||
			form.avatarUrl !== initialForm.avatarUrl
		);
	}, [
		form.avatarFile,
		form.avatarPreviewUrl,
		form.avatarUrl,
		initialForm.avatarPreviewUrl,
		initialForm.avatarUrl,
	]);

	const isHeaderDirty = useMemo(() => {
		return (
			form.headerFile !== null ||
			form.headerPreviewUrl !== initialForm.headerPreviewUrl ||
			form.headerUrl !== initialForm.headerUrl
		);
	}, [
		form.headerFile,
		form.headerPreviewUrl,
		form.headerUrl,
		initialForm.headerPreviewUrl,
		initialForm.headerUrl,
	]);

	const isDirty = useMemo(() => {
		const fieldChanged = TEXT_FIELD_KEYS.some(
			(key) => form[key] !== initialForm[key],
		);
		return fieldChanged || isAvatarDirty || isHeaderDirty;
	}, [form, initialForm, isAvatarDirty, isHeaderDirty]);

	useEffect(() => {
		let cancelled = false;
		const loadProfile = async () => {
			if (!isLoggedIn) {
				setLoading(false);
				return;
			}
			setError(null);
			try {
				const profile = await userApi.getProfile();
				if (!cancelled) {
					const mapped = mapProfileToForm(profile);
					setForm(mapped);
					setInitialForm({ ...mapped });
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error
							? err.message
							: "プロフィール情報の取得に失敗しました",
					);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};
		loadProfile();
		return () => {
			cancelled = true;
		};
	}, [isLoggedIn]);

	useEffect(
		() => () => {
			if (avatarObjectUrlRef.current) {
				URL.revokeObjectURL(avatarObjectUrlRef.current);
			}
			if (headerObjectUrlRef.current) {
				URL.revokeObjectURL(headerObjectUrlRef.current);
			}
		},
		[],
	);

	const handleFieldChange =
		(
			field: TextFieldKey,
		): ((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void) =>
		(event) => {
			setSuccess(null);
			setError(null);
			setForm((previous) => ({
				...previous,
				[field]: event.target.value,
			}));
		};

	const resetAvatarFileInput = () => {
		if (avatarFileInputRef.current) {
			avatarFileInputRef.current.value = "";
		}
	};

	const resetHeaderFileInput = () => {
		if (headerFileInputRef.current) {
			headerFileInputRef.current.value = "";
		}
	};

	const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null;
		event.target.value = "";
		setSuccess(null);
		if (!file) {
			return;
		}

		if (!file.type.startsWith("image/")) {
			setError("画像ファイルを選択してください");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setError("アイコン画像は5MB以下にしてください");
			return;
		}

		setError(null);

		if (avatarObjectUrlRef.current) {
			URL.revokeObjectURL(avatarObjectUrlRef.current);
		}

		const previewUrl = URL.createObjectURL(file);
		avatarObjectUrlRef.current = previewUrl;
		setForm((previous) => ({
			...previous,
			avatarFile: file,
			avatarPreviewUrl: previewUrl,
		}));
	};

	const handleHeaderFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null;
		event.target.value = "";
		setSuccess(null);
		if (!file) {
			return;
		}

		if (!file.type.startsWith("image/")) {
			setError("画像ファイルを選択してください");
			return;
		}

		if (file.size > 9 * 1024 * 1024) {
			setError("ヘッダー画像は9MB以下にしてください");
			return;
		}

		setError(null);

		if (headerObjectUrlRef.current) {
			URL.revokeObjectURL(headerObjectUrlRef.current);
		}

		const previewUrl = URL.createObjectURL(file);
		headerObjectUrlRef.current = previewUrl;
		setForm((previous) => ({
			...previous,
			headerFile: file,
			headerPreviewUrl: previewUrl,
		}));
	};

	const handleAvatarReset = () => {
		if (avatarObjectUrlRef.current) {
			URL.revokeObjectURL(avatarObjectUrlRef.current);
			avatarObjectUrlRef.current = null;
		}
		resetAvatarFileInput();
		setSuccess(null);
		setError(null);
		setForm((previous) => ({
			...previous,
			avatarFile: null,
			avatarPreviewUrl: initialForm.avatarPreviewUrl,
			avatarUrl: initialForm.avatarUrl,
		}));
	};

	const handleHeaderReset = () => {
		if (headerObjectUrlRef.current) {
			URL.revokeObjectURL(headerObjectUrlRef.current);
			headerObjectUrlRef.current = null;
		}
		resetHeaderFileInput();
		setSuccess(null);
		setError(null);
		setForm((previous) => ({
			...previous,
			headerFile: null,
			headerPreviewUrl: initialForm.headerPreviewUrl,
			headerUrl: initialForm.headerUrl,
		}));
	};

	const handleFormReset = () => {
		if (avatarObjectUrlRef.current) {
			URL.revokeObjectURL(avatarObjectUrlRef.current);
			avatarObjectUrlRef.current = null;
		}
		if (headerObjectUrlRef.current) {
			URL.revokeObjectURL(headerObjectUrlRef.current);
			headerObjectUrlRef.current = null;
		}
		resetAvatarFileInput();
		resetHeaderFileInput();
		setError(null);
		setSuccess(null);
		setForm({ ...initialForm, avatarFile: null, headerFile: null });
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!isLoggedIn) {
			setError("ログインが必要です");
			return;
		}

		if (!form.name.trim()) {
			setError("ユーザー名は必須です");
			return;
		}

		if (!isDirty) {
			setSuccess(null);
			setError(null);
			return;
		}

		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			const formData = new FormData();

			const appendIfChanged = (key: TextFieldKey, fieldName: string) => {
				const currentValue = form[key];
				const initialValue = initialForm[key];
				if (currentValue === initialValue) {
					return;
				}
				const trimmedValue = currentValue.trim();
				formData.append(fieldName, trimmedValue);
			};

			appendIfChanged("name", "name");
			appendIfChanged("displayName", "displayName");
			appendIfChanged("email", "email");
			appendIfChanged("bio", "bio");
			appendIfChanged("location", "location");
			appendIfChanged("website", "website");
			appendIfChanged("birthday", "birthday");
			appendIfChanged("locale", "locale");
			appendIfChanged("theme", "theme");

			if (form.avatarFile) {
				formData.append("avatar", form.avatarFile);
			} else if (isAvatarDirty && form.avatarUrl !== initialForm.avatarUrl) {
				formData.append("avatarUrl", form.avatarUrl);
			}

			if (form.headerFile) {
				formData.append("header", form.headerFile);
			} else if (isHeaderDirty && form.headerUrl !== initialForm.headerUrl) {
				formData.append("headerUrl", form.headerUrl);
			}

			const updated = await userApi.updateProfile(formData);
			const mapped = mapProfileToForm(updated);
			setForm(mapped);
			setInitialForm({ ...mapped });
			resetAvatarFileInput();
			resetHeaderFileInput();
			if (avatarObjectUrlRef.current) {
				URL.revokeObjectURL(avatarObjectUrlRef.current);
				avatarObjectUrlRef.current = null;
			}
			if (headerObjectUrlRef.current) {
				URL.revokeObjectURL(headerObjectUrlRef.current);
				headerObjectUrlRef.current = null;
			}
			setSuccess("プロフィールを更新しました");
			updateUser({
				name: updated.name,
				displayName: updated.displayName ?? null,
				avatarUrl: updated.avatarUrl ?? null,
				headerUrl: updated.headerUrl ?? null,
				bio: updated.bio ?? null,
				location: updated.location ?? null,
				website: updated.website ?? null,
				birthday: updated.birthday ?? null,
				locale: updated.locale ?? null,
				theme: updated.theme ?? null,
			});
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("プロフィールの更新に失敗しました");
			}
		} finally {
			setSaving(false);
		}
	};

	const avatarInitials = useMemo(() => {
		if (form.displayName) {
			return form.displayName.charAt(0).toUpperCase();
		}
		if (form.name) {
			return form.name.charAt(0).toUpperCase();
		}
		return user?.name?.charAt(0).toUpperCase() ?? "?";
	}, [form.displayName, form.name, user?.name]);

	if (!isLoggedIn) {
		return (
			<>
				<AppHeaderWithAuth activePath="/settings" />
				<Container maxWidth="md" sx={{ py: 6 }}>
					<Paper sx={{ p: { xs: 3, md: 4 } }}>
						<Typography variant="h4" component="h1" gutterBottom>
							プロフィール設定
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
							アイコンや自己紹介、連絡先を更新するにはログインしてください。
						</Typography>
						<Typography variant="h6" gutterBottom>
							ログインが必要です
						</Typography>
						<Alert severity="info">
							プロフィールを編集するにはログインしてください。
						</Alert>
						<Box sx={{ mt: 2 }}>
							<Button variant="contained" onClick={() => navigate("/login")}>
								ログイン画面へ
							</Button>
						</Box>
					</Paper>
				</Container>
			</>
		);
	}

	return (
		<>
			<AppHeaderWithAuth activePath="/settings" />
			<Container maxWidth="md" sx={{ py: 6 }}>
				<Paper
					component="form"
					onSubmit={handleSubmit}
					noValidate
					sx={{ p: { xs: 3, md: 4 } }}
				>
					<Stack spacing={3}>
						<Box>
							<Typography variant="h4" component="h1" gutterBottom>
								プロフィール設定
							</Typography>
							<Typography variant="body1" color="text.secondary">
								アイコンや自己紹介、連絡先を更新して、他のユーザーにあなたのことを伝えましょう。
							</Typography>
						</Box>
						{error && <Alert severity="error">{error}</Alert>}
						{success && <Alert severity="success">{success}</Alert>}
						{loading ? (
							<Typography color="text.secondary">読み込み中...</Typography>
						) : (
							<Stack spacing={4}>
								<Box sx={{ position: "relative", mb: 8 }}>
									<Box
										sx={{
											height: { xs: 160, sm: 200 },
											borderRadius: 2,
											overflow: "hidden",
											backgroundColor: (theme) => theme.palette.grey[300],
											backgroundImage:
												form.headerPreviewUrl || form.headerUrl
													? `url(${form.headerPreviewUrl ?? form.headerUrl})`
													: "none",
											backgroundSize: "cover",
											backgroundPosition: "center",
										}}
									/>
									<Stack
										direction={{ xs: "column", sm: "row" }}
										spacing={1.5}
										sx={{ position: "absolute", top: 12, right: 12 }}
									>
										<Button
											component="label"
											variant="contained"
											startIcon={<PhotoCamera />}
											disabled={saving}
										>
											ヘッダー画像を選択
											<input
												type="file"
												accept="image/*"
												hidden
												onChange={handleHeaderFileChange}
												ref={headerFileInputRef}
											/>
										</Button>
										<Button
											variant="outlined"
											startIcon={<RestartAlt />}
											onClick={handleHeaderReset}
											disabled={!isHeaderDirty || saving}
										>
											登録済みに戻す
										</Button>
									</Stack>
									<Box
										sx={{
											position: "absolute",
											left: { xs: 16, sm: 32 },
											bottom: -48,
											display: "flex",
											alignItems: "flex-end",
											gap: 2,
										}}
									>
										<Avatar
											src={form.avatarPreviewUrl ?? form.avatarUrl ?? undefined}
											sx={{ width: 96, height: 96, border: "4px solid white" }}
										>
											{avatarInitials}
										</Avatar>
									</Box>
								</Box>
								<Stack
									direction={{ xs: "column", sm: "row" }}
									spacing={1.5}
									sx={{ mt: -4, ml: { xs: 0, sm: 16 } }}
								>
									<Button
										component="label"
										variant="contained"
										startIcon={<PhotoCamera />}
										disabled={saving}
									>
										アイコン画像を選択
										<input
											type="file"
											accept="image/*"
											hidden
											onChange={handleAvatarFileChange}
											ref={avatarFileInputRef}
										/>
									</Button>
									<Button
										variant="outlined"
										startIcon={<RestartAlt />}
										onClick={handleAvatarReset}
										disabled={!isAvatarDirty || saving}
									>
										登録済みの画像に戻す
									</Button>
								</Stack>
								{form.avatarFile && (
									<Typography variant="caption" color="text.secondary">
										選択中: {form.avatarFile.name}
									</Typography>
								)}
								{form.headerFile && (
									<Typography variant="caption" color="text.secondary">
										選択中のヘッダー: {form.headerFile.name}
									</Typography>
								)}

								<Divider />

								<Grid container spacing={2}>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											label="ユーザー名"
											value={form.name}
											required
											onChange={handleFieldChange("name")}
											inputProps={{ maxLength: 50 }}
											helperText="ログインに使用する名前。ユニークである必要があります。"
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											label="表示名"
											value={form.displayName}
											onChange={handleFieldChange("displayName")}
											inputProps={{ maxLength: 50 }}
											placeholder="Nice dig 太郎"
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12 }}>
										<TextField
											label="自己紹介"
											value={form.bio}
											onChange={handleFieldChange("bio")}
											multiline
											minRows={3}
											inputProps={{ maxLength: 160 }}
											placeholder="活動内容や得意分野を紹介しましょう"
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											label="所在地"
											value={form.location}
											onChange={handleFieldChange("location")}
											placeholder="東京都"
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											label="ウェブサイト"
											value={form.website}
											onChange={handleFieldChange("website")}
											type="url"
											placeholder="https://example.com"
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											label="誕生日"
											value={form.birthday}
											onChange={handleFieldChange("birthday")}
											type="date"
											InputLabelProps={{ shrink: true }}
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											label="メールアドレス"
											value={form.email}
											onChange={handleFieldChange("email")}
											type="email"
											fullWidth
										/>
									</Grid>
								</Grid>

								<Divider />

								<Grid container spacing={2}>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											label="表示言語"
											value={form.locale}
											onChange={handleFieldChange("locale")}
											placeholder="ja"
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											label="テーマ"
											value={form.theme}
											onChange={handleFieldChange("theme")}
											placeholder="light"
											fullWidth
										/>
									</Grid>
								</Grid>
							</Stack>
						)}
						<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
							<Button
								variant="outlined"
								startIcon={<RestartAlt />}
								onClick={handleFormReset}
								disabled={saving || loading || !isDirty}
							>
								入力内容をリセット
							</Button>
							<Link component={RouterLink} to="/home">
								<Button
									type="submit"
									variant="contained"
									disabled={saving || loading || !isDirty}
								>
									{saving ? "保存中..." : "保存する"}
								</Button>
							</Link>
						</Box>
					</Stack>
				</Paper>
			</Container>
		</>
	);
}
