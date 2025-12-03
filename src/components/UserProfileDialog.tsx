import CakeIcon from "@mui/icons-material/Cake";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
	Alert,
	Avatar,
	Box,
	CircularProgress,
	Dialog,
	DialogContent,
	IconButton,
	Link,
	Stack,
	Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import userApi from "../services/userApi";
import type { PublicUserProfile } from "../types/user";

interface UserProfileDialogProps {
	open: boolean;
	userId: number | null;
	onClose: () => void;
	fallback?: {
		name?: string;
		displayName?: string | null;
		avatarUrl?: string | null;
		headerUrl?: string | null;
	};
}

const trimValue = (value?: string | null) => value?.trim() ?? "";

const formatDate = (
	value?: string | null,
	options?: Intl.DateTimeFormatOptions,
) => {
	const normalized = trimValue(value);
	if (!normalized) {
		return null;
	}
	const date = new Date(normalized);
	if (Number.isNaN(date.getTime())) {
		return null;
	}
	return date.toLocaleDateString("ja-JP", options);
};

export default function UserProfileDialog({
	open,
	userId,
	onClose,
	fallback,
}: UserProfileDialogProps) {
	const [profile, setProfile] = useState<PublicUserProfile | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open || !userId) {
			setProfile(null);
			setLoading(false);
			setError(null);
			return;
		}

		let cancelled = false;
		setLoading(true);
		setError(null);
		setProfile(null);

		userApi
			.getPublicProfile(userId)
			.then((data) => {
				if (!cancelled) {
					setProfile(data);
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setError(
						err instanceof Error
							? err.message
							: "プロフィールを読み込めませんでした",
					);
				}
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [open, userId]);

	const displayName = useMemo(() => {
		const candidates = [
			profile?.displayName,
			fallback?.displayName,
			profile?.name,
			fallback?.name,
		]
			.map(trimValue)
			.filter(Boolean);

		return candidates[0] ?? "ユーザー";
	}, [profile, fallback]);

	const handleName = useMemo(() => {
		const normalized = trimValue(profile?.name ?? fallback?.name ?? "");
		return normalized;
	}, [profile, fallback]);

	const avatarSrc = profile?.avatarUrl ?? fallback?.avatarUrl ?? undefined;
	const headerSrc = profile?.headerUrl ?? fallback?.headerUrl ?? undefined;
	const bio = trimValue(profile?.bio);
	const location = trimValue(profile?.location);
	const website = trimValue(profile?.website);
	const birthdayLabel = formatDate(profile?.birthday);
	const joinedLabel = formatDate(profile?.joinedAt, {
		year: "numeric",
		month: "short",
	});
	const projectCount =
		typeof profile?.productsCount === "number" ? profile.productsCount : null;
	const showLoadingIndicator = loading && !profile;
	const avatarInitial = displayName.charAt(0).toUpperCase() || "?";

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogContent sx={{ p: 0 }}>
				<Box sx={{ position: "relative" }}>
					<Box
						sx={{
							height: 160,
							width: "100%",
							backgroundColor: (theme) => theme.palette.grey[300],
							backgroundImage: headerSrc ? `url(${headerSrc})` : "none",
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
					/>
					<IconButton
						onClick={onClose}
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
							backgroundColor: "rgba(0,0,0,0.35)",
							color: "white",
						}}
					>
						<CloseIcon />
					</IconButton>
					<Avatar
						sx={{
							width: 96,
							height: 96,
							border: (theme) => `4px solid ${theme.palette.background.paper}`,
							position: "absolute",
							bottom: -48,
							left: 24,
						}}
						src={avatarSrc}
						alt={displayName}
					>
						{avatarInitial}
					</Avatar>
				</Box>
				<Box sx={{ p: 3, pt: 6 }}>
					<Typography variant="h6" fontWeight="bold">
						{displayName}
					</Typography>
					{handleName && (
						<Typography variant="body2" color="text.secondary">
							@{handleName}
						</Typography>
					)}
					{bio && (
						<Typography variant="body1" sx={{ mt: 1.5 }}>
							{bio}
						</Typography>
					)}
					<Stack direction="row" spacing={2} sx={{ mt: 1.5, flexWrap: "wrap" }}>
						{location && (
							<Stack direction="row" spacing={0.5} alignItems="center">
								<LocationOnIcon fontSize="small" color="action" />
								<Typography variant="body2" color="text.secondary">
									{location}
								</Typography>
							</Stack>
						)}
						{website && (
							<Stack direction="row" spacing={0.5} alignItems="center">
								<LanguageIcon fontSize="small" color="action" />
								<Link
									href={website}
									target="_blank"
									rel="noopener noreferrer"
									underline="hover"
									variant="body2"
								>
									{website}
								</Link>
							</Stack>
						)}
					</Stack>
					<Stack direction="row" spacing={2} sx={{ mt: 1.5, flexWrap: "wrap" }}>
						{birthdayLabel && (
							<Stack direction="row" spacing={0.5} alignItems="center">
								<CakeIcon fontSize="small" color="action" />
								<Typography variant="body2" color="text.secondary">
									{birthdayLabel}
								</Typography>
							</Stack>
						)}
						{joinedLabel && (
							<Stack direction="row" spacing={0.5} alignItems="center">
								<CalendarMonthIcon fontSize="small" color="action" />
								<Typography variant="body2" color="text.secondary">
									{joinedLabel} 参加
								</Typography>
							</Stack>
						)}
					</Stack>
					<Stack direction="row" spacing={3} sx={{ mt: 2 }}>
						<Typography variant="body2">
							<strong>{projectCount ?? "—"}</strong> プロジェクト
						</Typography>
					</Stack>
					{showLoadingIndicator && (
						<Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
							<CircularProgress size={24} />
						</Box>
					)}
					{error && (
						<Alert severity="error" sx={{ mt: 2 }}>
							{error}
						</Alert>
					)}
				</Box>
			</DialogContent>
		</Dialog>
	);
}
