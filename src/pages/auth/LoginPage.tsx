import GitHubIcon from "@mui/icons-material/GitHub";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Checkbox,
	Container,
	Divider,
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

	const handleOAuthSignIn = () => {
		// GitHub OAuth の実装
		window.location.href = "null";
	};

	return (
		<>
			<AppHeaderWithAuth activePath="/login" />
			<Container maxWidth="xs" sx={{ mt: 8 }}>
				<Card elevation={3}>
					<CardContent>
						<Typography variant="h6" align="center" gutterBottom>
							Sign In
						</Typography>
						<Typography
							variant="body2"
							align="center"
							color="text.secondary"
							gutterBottom
						>
							Welcome, please sign in to continue
						</Typography>

						<Button
							fullWidth
							variant="outlined"
							startIcon={<GitHubIcon />}
							sx={{ mt: 2, mb: 2 }}
							onClick={handleOAuthSignIn}
							disabled={loading}
						>
							Sign In With GitHub
						</Button>

						<Divider>or</Divider>

						<form onSubmit={handleSubmit}>
							<Stack spacing={2} mt={2}>
								<TextField
									label="Email"
									type="email"
									placeholder="your@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									fullWidth
									disabled={loading}
								/>
								<TextField
									label="Password"
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
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<FormControlLabel
										control={
											<Checkbox
												checked={remember}
												onChange={(e) => setRemember(e.target.checked)}
												disabled={loading}
											/>
										}
										label="Remember me"
									/>
									<Link href="#" variant="body2">
										Forgot password?
									</Link>
								</Box>

								{error && <Alert severity="error">{error}</Alert>}

								<Button
									type="submit"
									variant="contained"
									fullWidth
									sx={{ fontWeight: "bold" }}
									disabled={loading}
								>
									{loading ? "Signing In..." : "Sign In"}
								</Button>
							</Stack>
						</form>

						<Typography variant="body2" align="center" sx={{ mt: 2 }}>
							Don't have an account?{" "}
							<Link component={RouterLink} to="/register" variant="body2">
								Sign up
							</Link>
						</Typography>

						<Typography
							variant="caption"
							align="center"
							sx={{ mt: 2, display: "block", color: "text.secondary" }}
						>
							Test credentials: test@example.com / password
						</Typography>
					</CardContent>
				</Card>
			</Container>
		</>
	);
};

export default LoginPage;
