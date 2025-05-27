import React, { useState } from 'react';
import { Header } from '../component/Header';

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

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 👇 ここに認証ロジックを入れる（例: API 呼び出し）
        if (email === 'test@example.com' && password === 'password') {
            console.log('ログイン成功！');
            navigate('/home'); // ホームへ遷移
        } else {
            setError('メールアドレスまたはパスワードが間違っています');
        }
    };

    const handleOAuthSignIn = () => {
        console.log('GitHub でサインイン（ここにOAuth処理）');
    };
    console.log('Login component rendered');

    return (
        <>
            <Header />
            <Container maxWidth="xs" sx={{ mt: 8 }}>
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>

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
                                />
                                <TextField
                                    label="Password"
                                    type="password"
                                    placeholder="******"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    fullWidth
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
                                >
                                    Sign In
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
                    </CardContent>
                </Card>
            </Container>
        </>
    );
};

export default Login;
