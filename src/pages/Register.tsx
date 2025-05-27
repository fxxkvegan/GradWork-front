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
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!agree) {
            setError('You must agree to the terms');
            return;
        }

        // ここに登録ロジックを入れる（例: API 呼び出し）
        if (email && password) {
            console.log('登録成功！');
            navigate('/home');
        } else {
            setError('全ての項目を入力してください');
        }
    };

    const handleOAuthSignUp = () => {
        console.log('GitHub でサインアップ（ここにOAuth処理）');
    };

    return (
        <>
            <Header />
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
                                <TextField
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="******"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    fullWidth
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={agree}
                                            onChange={(e) => setAgree(e.target.checked)}
                                            required
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
                                >
                                    Sign Up
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

export default Register;
