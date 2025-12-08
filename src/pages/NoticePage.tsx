import RateReviewIcon from "@mui/icons-material/RateReview";
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardActionArea,
	CardContent,
	Chip,
	CircularProgress,
	Container,
	Divider,
	Stack,
	Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import type { ReviewNotification } from "../types/notification";

const NoticePage = () => {
	const navigate = useNavigate();
	const { isLoggedIn } = useAuth();
	const {
		notifications,
		unreadNotifications,
		loading,
		error,
		refresh,
		markAsRead,
	} = useNotifications();

	const hasNotifications = useMemo(
		() => notifications.length > 0,
		[notifications.length],
	);

	const handleOpenDetail = (notice: ReviewNotification) => {
		navigate(`/item/${notice.productId}`);
	};

	useEffect(() => {
		if (!isLoggedIn) {
			navigate("/login", { replace: true });
		}
	}, [isLoggedIn, navigate]);

	useEffect(() => {
		if (!isLoggedIn) {
			return;
		}
		if (unreadNotifications.length === 0) {
			return;
		}
		void markAsRead(unreadNotifications.map((notice) => notice.id));
	}, [isLoggedIn, markAsRead, unreadNotifications]);

	if (!isLoggedIn) {
		return null;
	}

	return (
		<Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
			<AppHeaderWithAuth activePath="/notifications" />
			<Container maxWidth="md" sx={{ pt: 10, pb: 6 }}>
				<Stack
					spacing={2}
					direction={{ xs: "column", sm: "row" }}
					justifyContent="space-between"
					alignItems={{ xs: "flex-start", sm: "center" }}
				>
					<Typography variant="h4">通知</Typography>
					<Button variant="outlined" onClick={refresh} disabled={loading}>
						{loading ? "更新中..." : "最新の情報に更新"}
					</Button>
				</Stack>

				{loading && (
					<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
						<CircularProgress />
					</Box>
				)}

				{!loading && error && <Alert severity="error">{error}</Alert>}

				{!loading && !error && !hasNotifications && (
					<Alert severity="info">
						まだ通知はありません。他のユーザーからレビューが投稿されると表示されます。
					</Alert>
				)}

				{!loading && !error && hasNotifications && (
					<Stack spacing={2} sx={{ mt: 2 }}>
						{notifications.map((notice) => {
							const elapsed = formatDistanceToNow(new Date(notice.createdAt), {
								locale: ja,
								addSuffix: true,
							});
							return (
								<Card key={notice.id}>
									<CardActionArea onClick={() => handleOpenDetail(notice)}>
										<CardContent>
											<Stack
												spacing={2}
												direction="row"
												alignItems="flex-start"
											>
												{notice.productImage ? (
													<Avatar
														src={notice.productImage}
														alt={notice.productName}
														variant="rounded"
														sx={{ width: 72, height: 72 }}
													/>
												) : (
													<Avatar
														variant="rounded"
														sx={{ width: 72, height: 72, bgcolor: "grey.200" }}
													>
														<RateReviewIcon color="action" />
													</Avatar>
												)}
												<Box sx={{ flexGrow: 1 }}>
													<Stack
														direction="row"
														spacing={1}
														alignItems="center"
														flexWrap="wrap"
													>
														<Avatar
															src={notice.reviewerAvatar ?? undefined}
															alt={notice.reviewerName}
															sx={{ width: 32, height: 32 }}
														>
															{notice.reviewerName.charAt(0) || "?"}
														</Avatar>
														<Typography variant="subtitle1">
															{notice.reviewerName}
														</Typography>
														<Typography variant="body2" color="text.secondary">
															{elapsed}
														</Typography>
													</Stack>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ mt: 1 }}
													>
														{notice.reviewerName} さんが「{notice.productName}
														」にレビューを投稿しました。
													</Typography>
													<Stack
														direction="row"
														spacing={1}
														alignItems="center"
														sx={{ mt: 1 }}
													>
														<Chip
															label={`評価 ${notice.rating.toFixed(1)}`}
															size="small"
															color="primary"
														/>
														<Divider orientation="vertical" flexItem />
														<Typography variant="subtitle1">
															{notice.title}
														</Typography>
													</Stack>
													<Typography
														variant="body2"
														sx={{ mt: 1 }}
														color="text.primary"
													>
														{notice.body}
													</Typography>
												</Box>
											</Stack>
										</CardContent>
									</CardActionArea>
								</Card>
							);
						})}
					</Stack>
				)}
			</Container>
		</Box>
	);
};

export default NoticePage;
