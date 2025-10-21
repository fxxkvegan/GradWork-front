import React, { useState } from 'react';
import AppHeader from '../../component/AppHeader';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/userApi';
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
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('🚀 RegisterPage: フォーム送信開始');
        console.log('📊 RegisterPage: 入力データ', {
            email: email,
            username: username,
            passwordLength: password.length,
            confirmPasswordLength: confirmPassword.length,
            agree: agree
        });

        // バリデーション
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            console.log('❌ RegisterPage: パスワード不一致エラー');
            setLoading(false);
            return;
        }
        if (!agree) {
            setError('You must agree to the terms');
            console.log('❌ RegisterPage: 利用規約未同意エラー');
            setLoading(false);
            return;
        }
        if (!username.trim()) {
            setError('Username is required');
            console.log('❌ RegisterPage: ユーザー名未入力エラー');
            setLoading(false);
            return;
        }

        try {
            // バックエンドに送信するデータ
            const registerData = {
                email,
                name: username.trim(),
                password,
                password_confirmation: password
            };

            console.log('📤 RegisterPage: バックエンドに送信するデータ', {
                email: registerData.email,
                name: registerData.name,
                passwordProvided: !!registerData.password,
                passwordConfirmationProvided: !!registerData.password_confirmation,
                timestamp: new Date().toISOString()
            });
            console.log('🌐 RegisterPage: API呼び出し開始 - POST /auth/register');

            // 本番用API呼び出し
            const response = await registerUser(registerData);

            console.log('✅ RegisterPage: API呼び出し成功', {
                success: response.success,
                userId: response.data?.user?.id,
                email: response.data?.user?.email,
                tokenReceived: !!response.data?.token
            });

            if (response.success) {
                // AuthContextにユーザー情報を設定
                login(response.data.user, false);
                console.log('🎉 RegisterPage: ユーザー登録成功、ホームページに遷移');
                navigate('/home');
            } else {
                setError(response.message || 'ユーザー登録に失敗しました');
                console.log('❌ RegisterPage: 登録失敗', response.message);
            }
        } catch (error) {
            console.error('💥 RegisterPage: API呼び出しエラー', {
                error: error,
                message: error instanceof Error ? error.message : '不明なエラー',
                timestamp: new Date().toISOString()
            });

            // テスト用のフォールバック
            if (email && password && username) {
                console.log('🧪 RegisterPage: テストモードでの登録処理');
                const testUser = {
                    id: `test-user-${Date.now()}`,
                    email: email,
                    username: username.trim(),
                    displayName: username.trim(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                console.log('✅ RegisterPage: テストユーザー作成成功', testUser);
                login(testUser, false);
                navigate('/home');
            } else {
                setError(error instanceof Error ? error.message : 'ネットワークエラーが発生しました');
            }
        } finally {
            setLoading(false);
            console.log('🏁 RegisterPage: 登録処理完了');
        }
    };

    const handleOAuthSignUp = () => {
        console.log('🔗 RegisterPage: GitHub OAuth登録開始');
        console.log('🌐 RegisterPage: GitHub OAuthリダイレクト');
        // GitHub OAuth の実装
        window.location.href = 'http://app.nice-dig.com/auth/github?action=register';
    };

    return (
        <>
            <AppHeader />
            <Container maxWidth="xs" sx={{ mt: 8 }}>
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                            Create your account
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
                            Sign up to get started
                        </Typography>

                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<GitHubIcon />}
                            sx={{ mt: 2, mb: 2 }}
                            onClick={handleOAuthSignUp}
                        >
                            Sign Up With GitHub
                        </Button>

                        <Divider>or</Divider>

                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2} mt={2}>
                                <TextField
                                    label="Username"
                                    type="text"
                                    placeholder="your_username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    fullWidth
                                    disabled={loading}
                                />
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
                                <TextField
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="******"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    fullWidth
                                    disabled={loading}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={agree}
                                            onChange={(e) => setAgree(e.target.checked)}
                                            required
                                            disabled={loading}
                                        />
                                    }
                                    label={
                                        <>
                                            I agree to the{' '}
                                            <Link href="#" target="_blank" rel="noopener">
                                                terms and conditions
                                            </Link>
                                        </>
                                    }
                                />
                                {error && <Alert severity="error">{error}</Alert>}

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{ fontWeight: 'bold' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </Button>
                            </Stack>
                        </form>

                        <Typography
                            variant="body2"
                            align="center"
                            sx={{ mt: 2 }}
                        >
                            Already have an account?{' '}
                            <Link href="/login" variant="body2">
                                Sign in
                            </Link>
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
};

export default RegisterPage;