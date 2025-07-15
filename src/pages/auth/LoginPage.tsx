import React, { useState } from 'react';
import AppHeader from '../../component/AppHeader';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/userApi';

import {
    Container,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    Stack,
    Divider,
    Checkbox,
    FormControlLabel,
    Link,
    Box,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('🚀 LoginPage: ログイン開始');
        console.log('📊 LoginPage: 入力データ', {
            email: email,
            passwordLength: password.length,
            remember: remember,
            timestamp: new Date().toISOString()
        });

        try {
            // バックエンドに送信するデータ
            const loginData = { email, password, remember };

            console.log('📤 LoginPage: バックエンドに送信するデータ', {
                email: loginData.email,
                passwordProvided: !!loginData.password,
                remember: loginData.remember,
                timestamp: new Date().toISOString()
            });
            console.log('🌐 LoginPage: API呼び出し開始 - POST /auth/login');

            // 本番用API呼び出し
            const response = await loginUser(loginData);

            console.log('✅ LoginPage: API呼び出し成功', {
                success: response.success,
                userId: response.data?.user?.id,
                username: response.data?.user?.username,
                email: response.data?.user?.email,
                tokenReceived: !!response.data?.token,
                refreshTokenReceived: !!response.data?.refreshToken
            });

            if (response.success) {
                // AuthContextにユーザー情報を設定
                login(response.data.user, remember);
                console.log('🎉 LoginPage: ログイン成功、ホームページに遷移');
                navigate('/home');
            } else {
                setError(response.message || 'ログインに失敗しました');
                console.log('❌ LoginPage: ログイン失敗', response.message);
            }
        } catch (error) {
            console.error('💥 LoginPage: API呼び出しエラー', {
                error: error,
                message: error instanceof Error ? error.message : '不明なエラー',
                timestamp: new Date().toISOString()
            });

            // テスト用のフォールバック
            if (email === 'test@example.com' && password === 'password') {
                console.log('🧪 LoginPage: テストモードでのログイン処理');
                const testUser = {
                    id: 'test-user-1',
                    email: 'test@example.com',
                    username: 'testuser',
                    displayName: 'Test User',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                console.log('✅ LoginPage: テストユーザーログイン成功', testUser);
                login(testUser, remember);
                navigate('/home');
            } else {
                setError(error instanceof Error ? error.message : 'ネットワークエラーが発生しました');
            }
        } finally {
            setLoading(false);
            console.log('🏁 LoginPage: ログイン処理完了');
        }
    };

    const handleOAuthSignIn = () => {
        console.log('🔗 LoginPage: GitHub OAuthログイン開始');
        console.log('🌐 LoginPage: GitHub OAuthリダイレクト');
        // GitHub OAuth の実装
        window.location.href = 'http://app.nice-dig.com/auth/github?action=login';
    };

    console.log('LoginPage component rendered');

    return (
        <>
            <AppHeader />
            <Container maxWidth="xs" sx={{ mt: 8 }}>
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                            Sign In
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
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
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
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
                                    sx={{ fontWeight: 'bold' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </Stack>
                        </form>

                        <Typography
                            variant="body2"
                            align="center"
                            sx={{ mt: 2 }}
                        >
                            Don't have an account?{' '}
                            <Link href="/register" variant="body2">
                                Sign up
                            </Link>
                        </Typography>

                        <Typography
                            variant="caption"
                            align="center"
                            sx={{ mt: 2, display: 'block', color: 'text.secondary' }}
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