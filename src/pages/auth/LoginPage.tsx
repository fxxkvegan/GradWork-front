import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Checkbox,
	Container,
	FormControlLabel,
	Link,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AppHeaderWithAuth from "../../components/AppHeaderWithAuth";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/userApi";

const LoginPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			// バックエンドに送信するデータ
			const loginData = { email, password, remember };

			// 本番用API呼び出し
			const response = await loginUser(loginData);

			login({ ...response.user, token: response.token }, remember);
			navigate("/home");
		} catch (error) {
			console.error("💥 LoginPage: API呼び出しエラー", {
				error: error,
				message: error instanceof Error ? error.message : "不明なエラー",
				timestamp: new Date().toISOString(),
			});

			setError(
				error instanceof Error
					? error.message
					: "ネットワークエラーが発生しました",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<AppHeaderWithAuth activePath="/login" />
			<Box
				component="section"
				sx={{
					backgroundColor: "#f5f5f7",
					minHeight: { xs: "calc(100vh - 64px)", md: "calc(100vh - 88px)" },
					display: "flex",
					alignItems: "stretch",
					py: { xs: 6, md: 10 },
				}}
			>
				<Container maxWidth="sm">
					<Card
						elevation={4}
						sx={{
							borderRadius: 3,
							boxShadow: "0 20px 45px rgba(15,23,42,0.12)",
						}}
					>
						<CardContent sx={{ p: { xs: 4, md: 6 } }}>
							<Stack spacing={3}>
								<Box textAlign="center">
									<Typography variant="h5" fontWeight="bold">
										ログイン
									</Typography>
									<Typography variant="body2" color="text.secondary" mt={1}>
										メールアドレスとパスワードを入力してください
									</Typography>
								</Box>

								{error && <Alert severity="error">{error}</Alert>}

								<form onSubmit={handleSubmit}>
									<Stack spacing={2.5}>
										<TextField
											label="メールアドレス"
											type="email"
											placeholder="sample@example.com"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
											fullWidth
											disabled={loading}
										/>
										<TextField
											label="パスワード"
											type="password"
											placeholder="******"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											fullWidth
											disabled={loading}
										/>

										<Box
											sx={{
												display: "flex",
												flexDirection: { xs: "column", sm: "row" },
												justifyContent: "space-between",
												alignItems: { xs: "flex-start", sm: "center" },
												gap: 1,
											}}
										>
											<FormControlLabel
												control={
													<Checkbox
														checked={remember}
														onChange={(e) => setRemember(e.target.checked)}
														color="primary"
														disabled={loading}
													/>
												}
												label="ログイン情報を保存する"
											/>
											<Link href="#" underline="hover" variant="body2">
												パスワードをお忘れの方はこちら
											</Link>
										</Box>

										<Button
											type="submit"
											variant="contained"
											fullWidth
											sx={{ fontWeight: "bold", py: 1.25 }}
											disabled={loading}
										>
											{loading ? "ログイン中..." : "ログイン"}
										</Button>
									</Stack>
								</form>

								<Typography variant="body2" align="center">
									アカウントをお持ちでない方は{" "}
									<Link component={RouterLink} to="/register" variant="body2">
										新規登録
									</Link>
								</Typography>
							</Stack>
						</CardContent>
					</Card>
				</Container>
			</Box>
		</>
	);
};

export default LoginPage;
