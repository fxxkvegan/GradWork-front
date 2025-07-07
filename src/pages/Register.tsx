import React, { useState } from 'react';
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
    Link as MuiLink,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Register: React.FC = () => {
    /* ---------- state ---------- */
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    /* ---------- handlers ---------- */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // front-side validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!agree) {
            setError('You must agree to the terms');
            return;
        }
        if (!email || !password) {
            setError('全ての項目を入力してください');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            // 実際の登録 API へ POST
            // ルートが /auth/signup なので合わせる
            const { data } = await axios.post('/api/auth/signup', {
                email,
                password,
            });

            // token をまだ使わない場合は 2 引数で OK
            login(data.user, true);

            navigate('/');
        } catch (err: unknown) {
            console.error('登録エラー:', err);
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || '登録に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    /* ---------- JSX ---------- */
    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h6" align="center" gutterBottom>
                        Create your account
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
                        Sign up to get started
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                fullWidth
                                disabled={isLoading}
                            />
                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                fullWidth
                                disabled={isLoading}
                            />
                            <TextField
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                fullWidth
                                disabled={isLoading}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={agree}
                                        onChange={(e) => setAgree(e.target.checked)}
                                        required
                                        disabled={isLoading}
                                    />
                                }
                                label={
                                    <>
                                        I agree to the{' '}
                                        <MuiLink href="#" target="_blank" rel="noopener">
                                            terms and conditions
                                        </MuiLink>
                                    </>
                                }
                            />

                            {error && <Alert severity="error">{error}</Alert>}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{ fontWeight: 'bold' }}
                                disabled={isLoading}
                            >
                                {isLoading ? '登録中…' : 'Sign Up'}
                            </Button>
                        </Stack>
                    </form>

                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                        Already have an account?{' '}
                        <MuiLink component={RouterLink} to="/login" variant="body2">
                            Sign in
                        </MuiLink>
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Register;
