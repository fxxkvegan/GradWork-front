import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Box,
    CircularProgress,
    Typography,
    Alert,
    Paper
} from '@mui/material';
import axios from 'axios';

const GitHubCallback: React.FC = () => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
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
                // 開発環境ではモックレスポンスを使用（APIが実装されるまで）
                if (import.meta.env.DEV) {
                    console.log("開発環境でのモック認証を使用");
                    // 1秒待って認証をシミュレート
                    await new Promise(resolve => setTimeout(resolve, 1000));                    // モックユーザーデータ
                    const mockUser = {
                        id: '123',
                        name: 'GitHubユーザー',
                        email: 'github@example.com',
                        avatarUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                    };

                    // 成功を模擬
                    authCtx.login(mockUser, true);
                    return;
                }

                try {
                    const { data } = await axios.post("/api/auth/github/callback", { code });
                    console.log("APIレスポンス:", data);                    // ユーザー情報をAuthContextに保存
                    // Remember meの状態はURLから取得できないので、デフォルトでtrue
                    authCtx.login(data.user, true);
                } catch (err) {
                    console.error("GitHub認証エラー:", err);
                    setError(true);
                    setErrorMessage('GitHub認証に失敗しました。もう一度お試しください。');
                    setLoading(false);
                }
            } catch (err) {
                console.error("GitHub認証エラー:", err);
                setError(true);
                setErrorMessage('GitHub認証に失敗しました。もう一度お試しください。');
                setLoading(false);
            }
        };

        handleCallback();
    }, [navigate, authCtx]);

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh',
                }}
            >                {loading ? (
                <>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 3 }}>
                        サインイン中...
                    </Typography>
                </>
            ) : (
                error && (
                    <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorMessage}
                        </Alert>
                        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
                            <RouterLink to="/login">ログインページに戻る</RouterLink>
                        </Typography>
                    </Paper>
                )
            )}
            </Box>
        </Container>
    );
};

export default GitHubCallback;
