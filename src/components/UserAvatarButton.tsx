import { Avatar, Box, IconButton } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import UserProfileDialog from "./UserProfileDialog";

interface UserAvatarButtonProps {
	userId?: number | string | null;
	name?: string | null;
	displayName?: string | null;
	avatarUrl?: string | null;
	headerUrl?: string | null;
	size?: number;
	disabled?: boolean;
	sx?: SxProps<Theme>;
	avatarSx?: SxProps<Theme>;
	buttonSx?: SxProps<Theme>;
}

export default function UserAvatarButton({
	userId,
	name,
	displayName,
	avatarUrl,
	headerUrl,
	size = 40,
	disabled = false,
	sx,
	avatarSx,
	buttonSx,
}: UserAvatarButtonProps) {
	const [open, setOpen] = useState(false);
	const normalizedId = useMemo(() => {
		if (userId === null || userId === undefined) {
			return null;
		}
		const value = typeof userId === "string" ? Number(userId) : userId;
		return Number.isFinite(value) && value > 0 ? value : null;
	}, [userId]);
	const canOpen = !disabled && normalizedId !== null;
	const labelSource = (displayName ?? name ?? "").trim();
	const initial = labelSource ? labelSource.charAt(0).toUpperCase() : "U";
	const handleOpen = () => {
		if (canOpen) {
			setOpen(true);
		}
	};
	const handleClose = () => setOpen(false);

	return (
		<>
			<Box sx={{ display: "inline-flex", ...sx }}>
				<IconButton
					onClick={handleOpen}
					disabled={!canOpen}
					sx={{ p: 0, width: size, height: size, ...buttonSx }}
				>
					<Avatar
						src={avatarUrl ?? undefined}
						alt={labelSource || "ユーザー"}
						sx={{ width: size, height: size, ...avatarSx }}
					>
						{initial}
					</Avatar>
				</IconButton>
			</Box>
			<UserProfileDialog
				open={open}
				userId={normalizedId}
				onClose={handleClose}
				fallback={{
					name: name ?? undefined,
					displayName: displayName ?? undefined,
					avatarUrl: avatarUrl ?? undefined,
					headerUrl: headerUrl ?? undefined,
				}}
			/>
		</>
	);
}
