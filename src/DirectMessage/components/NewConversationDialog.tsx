import {
	Autocomplete,
	Avatar,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { fetchPotentialParticipants } from "../api/dm";
import type { CreateConversationPayload } from "../types";

interface UserOption {
	id: number;
	name: string;
	displayName?: string | null;
	avatarUrl?: string | null;
}

interface NewConversationDialogProps {
	open: boolean;
	onClose: () => void;
	onCreate: (payload: CreateConversationPayload) => Promise<void>;
	currentUserId?: number | null;
}

const NewConversationDialog = ({
	open,
	onClose,
	onCreate,
	currentUserId,
}: NewConversationDialogProps) => {
	const [options, setOptions] = useState<UserOption[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
	const [title, setTitle] = useState("");
	const [loading, setLoading] = useState(false);
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			return;
		}

		setLoading(true);
		setError(null);
		setSelectedUsers([]);
		setTitle("");

		fetchPotentialParticipants()
			.then((users) => {
				const filtered = users.filter((user) => user.id !== currentUserId);
				setOptions(
					filtered.map((user) => ({
						id: user.id,
						name: user.name,
						displayName: user.display_name ?? user.displayName ?? user.name,
						avatarUrl: user.avatar_url ?? user.avatarUrl ?? null,
					})),
				);
			})
			.catch((err) => {
				const message =
					err instanceof Error ? err.message : "ユーザーの取得に失敗しました";
				setError(message);
			})
			.finally(() => setLoading(false));
	}, [open, currentUserId]);

	const requiresTitle = selectedUsers.length > 1;

	const dialogTitle = useMemo(() => {
		return requiresTitle ? "グループチャットを作成" : "新しいDM";
	}, [requiresTitle]);

	const handleCreate = async () => {
		if (selectedUsers.length === 0) {
			setError("参加者を選択してください");
			return;
		}

		if (requiresTitle && title.trim().length === 0) {
			setError("グループ名を入力してください");
			return;
		}

		setCreating(true);
		setError(null);
		try {
			await onCreate({
				participantIds: selectedUsers.map((user) => user.id),
				type: requiresTitle ? "group" : "direct",
				title: requiresTitle ? title.trim() : undefined,
			});
			onClose();
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "会話の作成に失敗しました";
			setError(message);
		} finally {
			setCreating(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>{dialogTitle}</DialogTitle>
			<DialogContent dividers>
				<Autocomplete
					multiple
					options={options}
					value={selectedUsers}
					onChange={(_, value) => setSelectedUsers(value)}
					getOptionLabel={(option) => option.displayName || option.name}
					loading={loading}
					renderOption={(props, option) => (
						<li {...props} key={option.id}>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<Avatar
									src={option.avatarUrl || undefined}
									sx={{ width: 28, height: 28 }}
								>
									{option.displayName?.charAt(0).toUpperCase() ??
										option.name.charAt(0).toUpperCase()}
								</Avatar>
								<span>{option.displayName || option.name}</span>
							</Box>
						</li>
					)}
					renderInput={(params) => (
						<TextField
							{...params}
							label="参加者"
							placeholder="ユーザーを検索"
						/>
					)}
				/>

				{requiresTitle && (
					<TextField
						fullWidth
						label="グループ名"
						sx={{ mt: 2 }}
						value={title}
						onChange={(event) => setTitle(event.target.value)}
					/>
				)}

				{error && (
					<Typography color="error" variant="body2" sx={{ mt: 2 }}>
						{error}
					</Typography>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={creating}>
					キャンセル
				</Button>
				<Button onClick={handleCreate} variant="contained" disabled={creating}>
					{creating ? "作成中..." : "作成"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default NewConversationDialog;
