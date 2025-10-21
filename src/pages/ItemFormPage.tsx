// ─────────────────────────────────────────────────────────────────────────────
// File: src/pages/ItemFormPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Stack,
    Rating,
    Divider,
    Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import axios from 'axios';
import AppHeader from '../component/AppHeader';

interface ProjectFormData {
    title: string;
    subtitle: string;
    rating: number;
    ratingCount: number;
    price: number;
    isFree: boolean;
    images: File[];
    downloadCount: number;
    lastUpdated: string;
    version: string;
    authorName: string;
    authorAvatar: File | null;
    authorRating: number;
    longDescription: string;
    frameworks: string[];
    languages: string[];
    databases: string[];
    tools: string[];
    features: string[];
    os: string;
    browser: string;
    memory: string;
}

export default function ItemFormPage() {
    const { itemId } = useParams<{ itemId?: string }>();
    const navigate = useNavigate();

    const [form, setForm] = useState<ProjectFormData>({
        title: '',
        subtitle: '',
        rating: 0,
        ratingCount: 0,
        price: 0,
        isFree: false,
        images: [],
        downloadCount: 0,
        lastUpdated: '',
        version: '',
        authorName: '',
        authorAvatar: null,
        authorRating: 0,
        longDescription: '',
        frameworks: [],
        languages: [],
        databases: [],
        tools: [],
        features: [],
        os: '',
        browser: '',
        memory: ''
    });

    useEffect(() => {
        if (itemId) {
            axios.get(`/api/products/${itemId}`)
                .then(res => {
                    const data = res.data;
                    setForm({
                        ...form,
                        title: data.title,
                        subtitle: data.shortDescription,
                        rating: data.rating.average,
                        ratingCount: data.rating.count,
                        price: data.price,
                        isFree: data.isFree,
                        downloadCount: data.downloadCount,
                        lastUpdated: data.lastUpdated,
                        version: data.version,
                        authorName: data.author.name,
                        authorRating: data.author.rating,
                        longDescription: data.longDescription,
                        frameworks: data.technicalDetails.framework,
                        languages: data.technicalDetails.language,
                        databases: data.technicalDetails.database || [],
                        tools: data.technicalDetails.tools || [],
                        features: data.features,
                        os: data.systemRequirements.os,
                        browser: data.systemRequirements.browser,
                        memory: data.systemRequirements.memory
                    });
                })
                .catch(error => {
                    console.error('Failed to fetch item data:', error);
                    // エラーが発生してもコンポーネントは表示する
                });
        }
    }, [itemId]);

    const handleChange = (key: keyof ProjectFormData) => (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = e.target.type === 'number'
            ? Number(e.target.value)
            : e.target.value;
        setForm({ ...form, [key]: value });
    };

    const handleSwitch = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, isFree: e.target.checked });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setForm({ ...form, images: files });
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setForm({ ...form, authorAvatar: e.target.files[0] });
    };

    const handleArrayChange = (key: 'frameworks' | 'languages' | 'databases' | 'tools' | 'features') => (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
        setForm({ ...form, [key]: items });
    };

    const handleDateChange = (date: Date | null) => {
        setForm({ ...form, lastUpdated: date ? date.toISOString().slice(0, 10) : '' });
    };

    const handleSubmit = () => {
        const payload = new FormData();
        Object.entries(form).forEach(([k, v]) => {
            if (k === 'images' && v instanceof Array) {
                v.forEach(file => payload.append('images', file));
            } else if (k === 'authorAvatar' && v) {
                payload.append('authorAvatar', v);
            } else {
                payload.append(k, String(v));
            }
        });
        const url = itemId ? `/api/products/${itemId}` : '/api/products';
        const method = itemId ? axios.put : axios.post;
        method(url, payload)
            .then(() => navigate('/'))
            .catch(error => {
                console.error('Failed to submit form:', error);
                alert('保存に失敗しました。もう一度お試しください。');
            });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={undefined}>
            <div className="item-form-page">
                <AppHeader activePath={itemId ? `/edit/${itemId}` : '/create'} />
                <Container maxWidth="md" sx={{ py: 4, mt: 6 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
                        戻る
                    </Button>

                    <Typography variant="h4" gutterBottom>
                        {itemId ? '作品を編集' : '新規作品を登録'}
                    </Typography>

                    <Stack spacing={3}>
                        {/* タイトル */}
                        <TextField
                            label="タイトル"
                            value={form.title}
                            onChange={handleChange('title')}
                            fullWidth
                        />

                        {/* サブタイトル */}
                        <TextField
                            label="サブタイトル"
                            value={form.subtitle}
                            onChange={handleChange('subtitle')}
                            fullWidth
                        />

                        {/* 長文説明 */}
                        <TextField
                            label="詳細説明"
                            value={form.longDescription}
                            onChange={handleChange('longDescription')}
                            fullWidth
                            multiline
                            rows={6}
                        />

                        {/* 価格 & 無料切替 */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="価格"
                                type="number"
                                value={form.price}
                                onChange={handleChange('price')}
                                disabled={form.isFree}
                            />
                            <FormControlLabel
                                control={<Switch checked={form.isFree} onChange={handleSwitch} />}
                                label="無料"
                            />
                        </Box>

                        {/* 評価 */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Typography>平均評価</Typography>
                            <Rating
                                value={form.rating}
                                precision={0.1}
                                onChange={(_, v) => setForm({ ...form, rating: v || 0 })}
                            />
                            <TextField
                                label="評価件数"
                                type="number"
                                value={form.ratingCount}
                                onChange={handleChange('ratingCount')}
                            />
                        </Box>

                        {/* 画像アップロード */}
                        <Box>
                            <Typography gutterBottom>画像アップロード</Typography>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<AddPhotoAlternateIcon />}
                            >
                                選択
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </Button>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                {form.images.map((file, idx) => (
                                    <Avatar
                                        key={idx}
                                        src={URL.createObjectURL(file)}
                                        variant="rounded"
                                        sx={{ width: 80, height: 80 }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* その他数値・文字 */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <TextField
                                label="ダウンロード数"
                                type="number"
                                value={form.downloadCount}
                                onChange={handleChange('downloadCount')}
                            />
                            <TextField
                                label="バージョン"
                                value={form.version}
                                onChange={handleChange('version')}
                            />
                            <DatePicker
                                label="最終更新日"
                                value={form.lastUpdated ? new Date(form.lastUpdated) : null}
                                onChange={handleDateChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'medium'
                                    }
                                }}
                            />
                        </Box>

                        <Divider />

                        {/* 作者情報 */}
                        <Typography variant="h6">作者情報</Typography>
                        <TextField
                            label="作者名"
                            value={form.authorName}
                            onChange={handleChange('authorName')}
                            fullWidth
                        />

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Typography>作者評価</Typography>
                            <Rating
                                value={form.authorRating}
                                precision={0.1}
                                onChange={(_, v) => setForm({ ...form, authorRating: v || 0 })}
                            />
                        </Box>

                        <Box>
                            <Typography gutterBottom>作者アバター</Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<AddPhotoAlternateIcon />}
                            >
                                アバター選択
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </Button>
                            {form.authorAvatar && (
                                <Box sx={{ mt: 2 }}>
                                    <Avatar
                                        src={URL.createObjectURL(form.authorAvatar)}
                                        sx={{ width: 80, height: 80 }}
                                    />
                                </Box>
                            )}
                        </Box>

                        <Divider />

                        {/* 技術スタック & 機能 */}
                        <TextField
                            label="フレームワーク (カンマ区切り)"
                            value={form.frameworks.join(',')}
                            onChange={handleArrayChange('frameworks')}
                            fullWidth
                        />
                        <TextField
                            label="言語 (カンマ区切り)"
                            value={form.languages.join(',')}
                            onChange={handleArrayChange('languages')}
                            fullWidth
                        />
                        <TextField
                            label="DB (カンマ区切り)"
                            value={form.databases.join(',')}
                            onChange={handleArrayChange('databases')}
                            fullWidth
                        />
                        <TextField
                            label="ツール (カンマ区切り)"
                            value={form.tools.join(',')}
                            onChange={handleArrayChange('tools')}
                            fullWidth
                        />
                        <TextField
                            label="主要機能 (カンマ区切り)"
                            value={form.features.join(',')}
                            onChange={handleArrayChange('features')}
                            fullWidth
                        />

                        <Divider />

                        {/* システム要件 */}
                        <TextField
                            label="対応OS"
                            value={form.os}
                            onChange={handleChange('os')}
                            fullWidth
                        />
                        <TextField
                            label="対応ブラウザ"
                            value={form.browser}
                            onChange={handleChange('browser')}
                            fullWidth
                        />
                        <TextField
                            label="推奨メモリ"
                            value={form.memory}
                            onChange={handleChange('memory')}
                            fullWidth
                        />

                        <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                            <Button variant="contained" onClick={handleSubmit} fullWidth>
                                保存
                            </Button>
                            <Button variant="outlined" onClick={() => navigate(-1)} fullWidth>
                                キャンセル
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </div>
        </LocalizationProvider>
    );
}
