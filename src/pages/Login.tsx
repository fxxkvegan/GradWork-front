import GitHubIcon from "@mui/icons-material/GitHub";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Checkbox,
	CircularProgress,
	Container,
	Divider,
	FormControlLabel,
	Link as MuiLink,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AppHeaderWithAuth from "../components/AppHeaderWithAuth";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/userApi";

// GitHub OAuth設定 - 環境変数から取得（.env.localから優先的に読み込む）
const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/login/github-callback`;

/**
 * ログインページコンポーネント
 * 通常のログインフォームとGitHub OAuth認証機能を提供
 */
const Login: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login, isLoggedIn } = useAuth();
	const navigate = useNavigate();

	/**
	 * 通常のログインフォーム送信処理
	 * @param e フォーム送信イベント
	 */
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const response = await loginUser({ email, password, remember });
			login({ ...response.user, token: response.token }, remember);
			navigate("/");
		} catch (error: unknown) {
			console.error("ログインエラー:", error);
			setError(
				error instanceof Error
					? error.message
					: "ログイン中にエラーが発生しました。もう一度お試しください。",
			);
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * GitHubでサインイン処理
	 * GitHub OAuth認証ページにリダイレクト
	 */
	const handleGitHubSignIn = () => {
		try {
			// エラーをリセット
			setError("");
			setIsLoading(true); // OAuth認証ページのURLを生成
			const scope = "user:email"; // 必要な権限スコープ
			const githubAuthUrl =
				`https://github.com/login/oauth/authorize?` +
				`client_id=${CLIENT_ID}` +
				`&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
				`&scope=${scope}`;

			// GitHub OAuth認証ページにリダイレクト
			window.location.href = githubAuthUrl;
		} catch (error) {
			console.error("GitHub認証リダイレクトエラー:", error);
			setError("GitHub認証ページへのリダイレクトに失敗しました。");
			setIsLoading(false);
		}
	};
	return (
		<>
			<AppHeaderWithAuth activePath="/login" />
			<Container maxWidth="xs" sx={{ mt: 8 }}>
				<Card elevation={3}>
					<CardContent>
						<Typography variant="h5" align="center" gutterBottom>
							ログイン
						</Typography>
						<Typography
							variant="body2"
							align="center"
							color="text.secondary"
							gutterBottom
						>
							ログインして開発コミュニティに参加しましょう
						</Typography>

						{isLoggedIn ? (
							<Button
								fullWidth
								variant="outlined"
								startIcon={<GitHubIcon />}
								sx={{ mt: 2, mb: 2 }}
								disabled
							>
								すでにログインしています
							</Button>
						) : (
							<Button
								fullWidth
								variant="outlined"
								startIcon={<GitHubIcon />}
								sx={{ mt: 2, mb: 2 }}
								onClick={handleGitHubSignIn}
								disabled={isLoading}
							>
								GitHub でサインイン
							</Button>
						)}

						<Divider>または</Divider>

						<form onSubmit={handleSubmit}>
							<Stack spacing={2} mt={2}>
								<TextField
									label="メールアドレス"
									type="email"
									placeholder="your@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									fullWidth
									disabled={isLoading || isLoggedIn}
								/>
								<TextField
									label="パスワード"
									type="password"
									placeholder="******"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									fullWidth
									disabled={isLoading || isLoggedIn}
								/>

								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<FormControlLabel
										control={
											<Checkbox
												checked={remember}
												onChange={(e) => setRemember(e.target.checked)}
												disabled={isLoading || isLoggedIn}
											/>
										}
										label="ログイン状態を保存"
									/>
									<MuiLink
										component="button"
										variant="body2"
										onClick={() => console.log("パスワードリセット機能")}
									>
										パスワードをお忘れですか？
									</MuiLink>
								</Box>

								{error && <Alert severity="error">{error}</Alert>}

								<Button
									type="submit"
									variant="contained"
									fullWidth
									sx={{ fontWeight: "bold" }}
									disabled={isLoading || isLoggedIn}
								>
									{isLoading ? <CircularProgress size={24} /> : "ログイン"}
								</Button>
							</Stack>
						</form>
						<Typography variant="body2" align="center" sx={{ mt: 2 }}>
							{" "}
							アカウントをお持ちでないですか？{" "}
							<MuiLink component={RouterLink} to="/register" variant="body2">
								新規登録
							</MuiLink>
						</Typography>
					</CardContent>
				</Card>
			</Container>
		</>
	);
};

export default Login;
