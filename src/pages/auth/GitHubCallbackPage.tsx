import {
	Alert,
	Box,
	CircularProgress,
	Container,
	Paper,
	Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GitHubCallbackPage: React.FC = () => {
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();
	const authCtx = useAuth();

	useEffect(() => {
		const handleCallback = async () => {
			try {
				const code = new URLSearchParams(window.location.search).get("code");
				if (!code) {
					console.error("認証コードが見つかりません");
					setErrorMessage("認証コードが見つかりません");
					setError(true);
					setLoading(false);
					return;
				}

				console.log("GitHubコードを受信:", code);

				if (import.meta.env.DEV) {
					console.log("開発環境でのモック認証を使用");
					await new Promise((resolve) => setTimeout(resolve, 1000));

					const mockUser = {
						id: 1,
						name: "GitHub User",
						email: "github@example.com",
						avatar_url:
							"https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
						locale: "ja",
						theme: "light",
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
						token: "mock-token",
					};

					authCtx.login(mockUser, true);
					navigate("/home");
					return;
				}

				try {
					const { data } = await axios.post(
						"http://app.nice-dig.com/auth/github/callback",
						{ code },
					);
					console.log("APIレスポンス:", data);

					if (data.success) {
						authCtx.login({ ...data.data.user, token: data.data.token }, true);
						navigate("/home");
					} else {
						throw new Error(data.message || "GitHub認証に失敗しました");
					}
				} catch (err) {
					console.error("GitHub認証エラー:", err);
					setError(true);
					setErrorMessage("GitHub認証に失敗しました。もう一度お試しください。");
					setLoading(false);
				}
			} catch (err) {
				console.error("GitHub認証エラー:", err);
				setError(true);
				setErrorMessage("GitHub認証に失敗しました。もう一度お試しください。");
				setLoading(false);
			}
		};

		handleCallback();
	}, [navigate, authCtx]);

	return (
		<Container maxWidth="sm">
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "80vh",
				}}
			>
				{loading ? (
					<>
						<CircularProgress size={60} />
						<Typography variant="h6" sx={{ mt: 3 }}>
							サインイン中...
						</Typography>
					</>
				) : (
					error && (
						<Paper elevation={3} sx={{ p: 4, width: "100%" }}>
							<Alert severity="error" sx={{ mb: 2 }}>
								{errorMessage}
							</Alert>
							<Typography variant="body1" sx={{ mt: 2, textAlign: "center" }}>
								<RouterLink to="/login">ログインページに戻る</RouterLink>
							</Typography>
						</Paper>
					)
				)}
			</Box>
		</Container>
	);
};

export default GitHubCallbackPage;
