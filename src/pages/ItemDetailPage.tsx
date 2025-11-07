import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Chip,
    Card,
    CardMedia,
    Paper,
    Stack,
    Rating,
    Divider,
    IconButton,
    Skeleton
} from '@mui/material';
import {
    Download as DownloadIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Share as ShareIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import './ItemDetailPage.css';
import axios from 'axios';

// プロジェクト詳細の型定義
interface ProjectDetail {
    id: number;
    name: string;
    description: string;
    image_url: string[];
    rating: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    categoryIds: number[];
}


function ItemDetailPage() {
    const { itemId } = useParams<{ itemId?: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    useEffect(() => {
        console.log("useEffect実行 - itemId:", itemId); // デバッグ用ログ

        if (itemId) {
            console.log("itemId存在確認済み、APIコール開始"); // デバッグ用ログ
            const getProject = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const res = await axios.get(`https://app.nice-dig.com/api/products/${itemId}`);

                    // レスポンスの構造を確認
                    if (res.data) {
                        setProject({
                            ...res.data,
                            image_url: JSON.parse(res.data.image_url) // 文字列を配列に変換
                        });
                        console.log("プロジェクトデータ取得成功:", res.data); // デバッグ用ログ
                    } else {
                        setError('プロジェクトデータが見つかりませんでした');
                    }
                } catch (error) {
                    console.error("プロジェクトの取得に失敗しました:", error);

                    // エラーの詳細を判別
                    if (axios.isAxiosError(error)) {
                        if (error.response?.status === 404) {
                            setError('プロジェクトが見つかりませんでした');
                        } else if (error.response?.status === 500) {
                            setError('サーバーエラーが発生しました');
                        } else {
                            setError('プロジェクトの取得に失敗しました');
                        }
                    } else {
                        setError('ネットワークエラーが発生しました');
                    }
                } finally {
                    setLoading(false);
                }
            };

            getProject();
        } else {
            console.log("itemId が存在しません:", itemId); // デバッグ用ログ
            setLoading(false);
            setError('プロジェクトIDが取得できませんでした');
        }
    }, [itemId]);


    const handleDownload = () => {
        alert('ダウンロード機能はデモ版のため利用できません');
    };

    const handleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('URLをクリップボードにコピーしました');
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Skeleton variant="rectangular" width="100%" height={400} />
                <Box sx={{ mt: 3 }}>
                    <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h5" align="center" color="error">
                    {error}
                </Typography>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="contained" onClick={handleBack}>
                        戻る
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!project) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h5" align="center">
                    プロジェクトが見つかりませんでした
                </Typography>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="contained" onClick={handleBack}>
                        戻る
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <div className="item-detail-page">
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* 戻るボタン */}
                <Box sx={{ mb: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                        sx={{ mb: 2 }}
                    >
                        一覧に戻る
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
                    {/* 左側：メインコンテンツ */}
                    <Box sx={{ flex: 2, minWidth: 0 }}>
                        {/* メイン画像 */}
                        <Card sx={{ mb: 3 }}>
                            <CardMedia
                                component="img"
                                height="400"
                                image={project.image_url[0]}
                                alt={project.name}
                                sx={{ objectFit: 'cover' }}
                            />
                        </Card>

                        {/* サムネイル画像 */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto' }}>
                            {
                            
                            
                            project.image_url.map((image, index) => (
                    
                                <Box
                                    key={index}
                                    sx={{
                                        minWidth: 120,
                                        height: 80,
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <img
                                        src={image}
                                        alt={`${project.name} ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>

                        {/* 詳細説明 */}
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                プロジェクト詳細
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    whiteSpace: 'pre-line',
                                    lineHeight: 1.7
                                }}
                            >
                                {project.description}
                            </Typography>
                        </Paper>

                        {/* 技術仕様・主要機能・システム要件 */}
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                使用技術・主要機能・システム要件
                            </Typography>

                            {/* 技術仕様 */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    フレームワーク・ライブラリ
                                </Typography>
                                {/* <Box sx={{ mb: 2 }}>
                                    {project.technicalDetails.framework.map((tech, index) => (
                                        <Chip
                                            key={index}
                                            label={tech}
                                            size="small"
                                            sx={{ mr: 1, mb: 1 }}
                                        />
                                    ))}
                                </Box> */}
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    プログラミング言語
                                </Typography>
                                {/* <Box>
                                    {project.technicalDetails.language.map((lang, index) => (
                                        <Chip
                                            key={index}
                                            label={lang}
                                            variant="outlined"
                                            size="small"
                                            sx={{ mr: 1, mb: 1 }}
                                        />
                                    ))}
                                </Box> */}
                            </Box>

                            {/* 主要機能 */}
                            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                                主要機能
                            </Typography>
                            {/* <Box sx={{ mb: 3 }}>
                                {project.features.map((feature, index) => (
                                    <Chip
                                        key={index}
                                        label={feature}
                                        variant="outlined"
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                ))}
                            </Box> */}

                            {/* システム要件 */}
                            {/* <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                                システム要件
                            </Typography>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                                gap: 2,
                                mb: 2
                            }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        OS
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        {project.systemRequirements.os}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        ブラウザ
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        {project.systemRequirements.browser}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        メモリ
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        {project.systemRequirements.memory}
                                    </Typography>
                                </Box>
                            </Box> */}
                        </Paper>
                    </Box>

                    {/* 右側：プロジェクト情報（スティッキー） */}
                    <Box sx={{ flex: 1, minWidth: 300 }}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
                            {/* タイトルと評価 */}
                            <Typography variant="h5" gutterBottom>
                                {project.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {project.created_at} に公開、 最終更新: {project.updated_at}
                            </Typography>

                            {/* 評価 */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Rating
                                    value={project.rating}
                                    precision={0.1}
                                    readOnly
                                    size="small"
                                />
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                    ({project.rating}件)
                                </Typography>
                            </Box>

                            {/* アクションボタン */}
                            <Stack spacing={2} sx={{ mb: 3 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    startIcon={<DownloadIcon />}
                                    onClick={handleDownload}
                                >
                                    ダウンロード
                                </Button>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                        onClick={handleFavorite}
                                        color={isFavorite ? 'error' : 'default'}
                                    >
                                        {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                    <IconButton onClick={handleShare}>
                                        <ShareIcon />
                                    </IconButton>
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            {/* プロジェクト情報 */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    ダウンロード数
                                </Typography>
                                <Typography variant="body1">
                                    {project.download_count}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    最終更新
                                </Typography>
                                <Typography variant="body1">
                                    {project.updated_at}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    バージョン
                                </Typography>
                                <Typography variant="body1">
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* 作者情報 */}
                            {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                    component="img"
                                    src={project.author.avatar}
                                    alt={project.author.name}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        mr: 2
                                    }}
                                />
                                <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        {project.author.name}
                                    </Typography>
                                    <Rating
                                        value={project.author.rating}
                                        precision={0.1}
                                        readOnly
                                        size="small"
                                    />
                                </Box>
                            </Box> */}
                        </Paper>
                    </Box>
                </Box>
            </Container>
        </div>
    );
}

export default ItemDetailPage;