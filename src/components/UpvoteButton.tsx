import { Alert, Button, Snackbar } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { removeUpvoteProduct, upvoteProduct } from "../services/productApi";

interface UpvoteButtonProps {
	productId: number;
	count: number;
	hasUpvoted: boolean;
	onChange?: (nextCount: number, nextHasUpvoted: boolean) => void;
	size?: "small" | "medium" | "large";
}

const UpvoteButton = ({
	productId,
	count,
	hasUpvoted,
	onChange,
	size = "small",
}: UpvoteButtonProps) => {
	const { isLoggedIn } = useAuth();
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info";
	}>({ open: false, message: "", severity: "info" });
	const [isSubmitting, setSubmitting] = useState(false);

	const handleClose = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	const handleToggle = async () => {
		if (!isLoggedIn) {
			setSnackbar({
				open: true,
				message: "ログインして投票してください",
				severity: "info",
			});
			return;
		}
		if (isSubmitting) return;

		const nextHasUpvoted = !hasUpvoted;
		const nextCount = Math.max(0, count + (nextHasUpvoted ? 1 : -1));
		onChange?.(nextCount, nextHasUpvoted);
		setSubmitting(true);
		try {
			if (nextHasUpvoted) {
				await upvoteProduct(productId);
			} else {
				await removeUpvoteProduct(productId);
			}
		} catch {
			onChange?.(count, hasUpvoted);
			setSnackbar({
				open: true,
				message: "投票に失敗しました",
				severity: "error",
			});
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Button
				variant={hasUpvoted ? "contained" : "outlined"}
				color={hasUpvoted ? "primary" : "inherit"}
				size={size}
				onClick={handleToggle}
				disabled={isSubmitting}
				aria-pressed={hasUpvoted}
				sx={{
					borderRadius: 999,
					fontWeight: 700,
					minWidth: 44,
					minHeight: 44,
					px: 1.5,
					py: 0.5,
					gap: 0.5,
					transition: "transform 120ms ease, background-color 120ms ease",
					"&:active": {
						transform: "scale(0.98)",
					},
				}}
			>
				<span aria-hidden>▲</span>
				<span
					style={{
						fontWeight: hasUpvoted ? 800 : 700,
						color: hasUpvoted ? "#FFFFFF" : "inherit",
					}}
				>
					{count}
				</span>
			</Button>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={2000}
				onClose={handleClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert onClose={handleClose} severity={snackbar.severity}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
};

export default UpvoteButton;
