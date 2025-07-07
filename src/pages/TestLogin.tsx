import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Avatar,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    Alert
} from '@mui/material';
import AppHeaderWithAuth from '../component/AppHeaderWithAuth';

/**
 * テストログインページコンポーネント
 * 開発環境でのみ利用可能。本番環境では何もレンダリングしない。
 * 複数のモックユーザーでログインできる機能を提供
 */
const TestLogin: React.FC = () => {
    // 本番環境の場合は何も表示しない
    if (import.meta.env.PROD) {
        return null;
    }
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { login, logout, isLoggedIn, user } = useAuth();    // テストユーザーのリスト
    const testUsers = [
        {
            id: 'test-user-1',
            name: '開発者ユーザー',
            email: 'developer@example.com',
            avatarUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            role: '開発者'
        },
        {
            id: 'test-user-2',
            name: '管理者ユーザー',
            email: 'admin@example.com',
            avatarUrl: 'https://github.githubassets.com/images/modules/logos_page/Octocat.png',
            role: '管理者'
        },
        {
            id: 'test-user-3',
            name: '一般ユーザー',
            email: 'user@example.com',
            avatarUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Logo.png',
            role: '一般ユーザー'
        }
    ];

    // テストユーザーでログイン
    const handleTestLogin = async () => {
        if (!selectedUser) {
            setError('ユーザーを選択してください');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 選択されたユーザーを取得
            const user = testUsers.find(user => user.id === selectedUser);

            if (!user) {
                throw new Error('選択されたユーザーが見つかりません');
            }

            // テスト用に少し遅延を入れる（1秒）
            await new Promise(resolve => setTimeout(resolve, 1000));

            // ユーザー情報をAuthContextに保存
            login(user, remember);

            // リダイレクトせずに成功状態を設定
            setError(null);
        } catch (error) {
            console.error('テストログインエラー:', error);
            setError('テストログインに失敗しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AppHeaderWithAuth activePath="/testlogin" />
            <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    テストログイン
                </Typography>
                <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
                    開発・テスト用のアカウントでログインします
                </Typography>

                <Alert severity="info" sx={{ mb: 4 }}>
                    この機能は開発環境でのみ利用可能です。本番環境では表示されません。
                </Alert>

                {isLoggedIn ? (
                    <Box sx={{ mb: 4 }}>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {user?.name}としてログイン中です。
                        </Alert>
                        <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            size="large"
                            onClick={() => {
                                logout();
                                setSelectedUser(null);
                            }}
                            sx={{ mt: 2 }}
                        >
                            ログアウト
                        </Button>
                    </Box>
                ) : (
                    <>                        {error && (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            {error}
                        </Alert>
                    )}

                        <Grid container spacing={3}>
                            {testUsers.map((user) => (
                                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }} key={user.id}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            border: selectedUser === user.id ? '2px solid #2196f3' : 'none',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                            }
                                        }}
                                        onClick={() => setSelectedUser(user.id)}
                                    >
                                        <CardContent sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            flexGrow: 1
                                        }}>
                                            <Avatar
                                                src={user.avatarUrl}
                                                alt={user.name}
                                                sx={{ width: 80, height: 80, mb: 2 }}
                                            />
                                            <Typography variant="h6" component="h2" gutterBottom>
                                                {user.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {user.email}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 1,
                                                    backgroundColor: '#f5f5f5',
                                                    color: '#333',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {user.role}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        disabled={loading}
                                    />
                                }
                                label="ログイン状態を保存"
                            />

                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={handleTestLogin}
                                disabled={!selectedUser || loading}
                                sx={{ mt: 2, minWidth: 200 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'テストログイン'}
                            </Button>
                        </Box>
                    </>
                )}
            </Container>
        </>
    );
};

export default TestLogin;
