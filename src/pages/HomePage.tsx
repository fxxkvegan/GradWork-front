"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Header } from "../component/Header";
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Stack,
    Button,
    Box,
    Container,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    Code as CodeIcon,
    Star as StarIcon,
    Favorite as FavoriteIcon,
    Devices as DevicesIcon,
    DataObject as DataObjectIcon,
    PhoneAndroid as PhoneAndroidIcon,
} from "@mui/icons-material";

import Splide from "@splidejs/splide";
import { AutoScroll } from "@splidejs/splide-extension-auto-scroll";
import "@splidejs/splide/dist/css/splide.min.css";
import "./HomePage.css";

/* ---------- 型定義 ---------- */
export interface Project {
    id: number;
    title: string;
    subtitle: string;
    img: string;
    category: string;
    rating: number;
    price: number;
    downloads: number;
    tags: string[];
}
export interface Category { name: string; icon: ReactNode; count: number }
export interface Stat { value: string; label: string }

/* ---------- 汎用フェッチフック ---------- */
const useApiData = <T,>(endpoint: string, fallback: T) => {
    const [data, setData] = useState<T>(fallback);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE}${endpoint}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch (e: any) {
                console.warn(`${endpoint} failed, using fallback`, e);
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [endpoint]);

    return { data, loading, error };
};

/* ---------- カードカルーセル ---------- */
const CardCarousel: React.FC<{ projects: Project[] }> = ({ projects }) => {
    const splideRef = useRef<HTMLDivElement | null>(null); useEffect(() => {
        if (!splideRef.current) return;

        const splide = new Splide(splideRef.current, {
            type: "loop",
            drag: false,
            focus: "center",
            perPage: 3,
            gap: "1rem",
            autoScroll: {
                speed: 0.5,  // より遅いスクロール速度（0.9から0.5に変更）
                pauseOnHover: true,
                autoStart: true,
                rewind: false // ループを滑らかにするため
            },
            breakpoints: {
                1200: { perPage: 3, gap: "1rem" },    // PCサイズ - 3枚表示
                960: { perPage: 2, gap: "0.8rem" },   // タブレットサイズ - 2枚表示
                600: { perPage: 1, gap: "0.5rem" }    // スマホサイズ - 1枚表示
            },
            extensions: { AutoScroll },
            padding: { left: 10, right: 10 } // 両端に余白を追加 - 横揺れ防止に重要
        });

        splide.mount();

        // ★ destroy を"実行する関数"を返す → 戻り値は void なので TS エラーが出ない
        return () => {
            splide.destroy();
        };
    }, [projects]);

    return (
        <div ref={splideRef} className="splide project-carousel">
            <div className="splide__track">
                <ul className="splide__list">
                    {projects.map((p) => (
                        <li key={p.id} className="splide__slide">
                            <Card className="project-card">
                                <Box className="card-image-container">
                                    <CardMedia component="img" image={p.img} alt={p.title} />
                                    <Box className="card-overlay">
                                        <Chip label={p.category} size="small" className="category-chip" />
                                    </Box>
                                    <IconButton size="small" className="favorite-button">
                                        <FavoriteIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <CardContent className="card-content">
                                    <Box className="card-header">
                                        <Typography variant="subtitle2">{p.downloads} DL</Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <StarIcon fontSize="small" />
                                            <Typography variant="subtitle2">{p.rating}</Typography>
                                        </Box>
                                    </Box>

                                    <Typography variant="subtitle1" fontWeight="bold">{p.title}</Typography>
                                    <Typography variant="body2" className="project-description">{p.subtitle}</Typography>

                                    <Box className="tags-container">
                                        {p.tags.map((t) => (
                                            <Chip key={t} label={t} size="small" variant="outlined" className="tag-chip" />
                                        ))}
                                    </Box>

                                    <Box className="card-footer">
                                        <Typography variant="h6" className="price-text">¥{p.price.toLocaleString()}</Typography>
                                        <Button size="small" variant="contained" disableElevation className="view-button">
                                            詳細を見る
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

/* ---------- HomePage ---------- */
const HomePage: React.FC = () => {
    /* ダミー (API 失敗時用) */
    const dummyProjects: Project[] = [{
        id: 0, title: "Demo", subtitle: "API fallback",
        img: "https://picsum.photos/500/600?rand=1", category: "デモ",
        rating: 4.5, price: 0, downloads: 0, tags: ["Demo"],
    }];
    const dummyCategories: Category[] = [{ name: "Web開発", icon: <CodeIcon />, count: 0 }];
    const dummyStats: Stat[] = [{ value: "0", label: "プロジェクト" }];

    /* API 取得 */
    const { data: projects, loading: loadingP } = useApiData<Project[]>("/projects", dummyProjects);
    const { data: categories } = useApiData<Category[]>("/categories", dummyCategories);
    const { data: stats } = useApiData<Stat[]>("/stats", dummyStats);

    return (
        <div className="homepage">
            <Header />            {/* ヒーロー */}
            <Box className="hero-section">
                <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                    <Box className="hero-content">
                        <Typography variant="h2" className="hero-title">
                            開発
                        </Typography>
                        <Typography variant="h5" className="hero-subtitle">
                            開発中
                        </Typography>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} className="hero-buttons">
                            <Button variant="contained" size="large" startIcon={<CodeIcon />}>
                                プロジェクトを探す
                            </Button>
                            <Button variant="outlined" size="large">
                                販売者として参加
                            </Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>            {/* 注目のプロジェクト */}
            <Container maxWidth="lg" className="featured-section" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                <Typography variant="h4" className="section-title">注目のプロジェクト</Typography>
                {loadingP ? (
                    <Box className="loading-container"><CircularProgress /></Box>
                ) : projects.length === 0 ? (
                    <Alert severity="info" className="api-error-alert">現在、表示できるプロジェクトがありません。</Alert>
                ) : (
                    <CardCarousel projects={projects} />
                )}
            </Container>            {/* カテゴリ */}
            <Box className="category-section">
                <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                    <Typography variant="h4" className="section-title">カテゴリから探す</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1, sm: 2, md: 3 }, mt: 4 }}>
                        {categories.map((c) => (
                            <Box key={c.name} sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 30%", lg: "1 1 23%" }, mb: 2 }} className="category-item">
                                <Box className="category-content">
                                    <Box sx={{ fontSize: '2rem', mb: 1 }}>{c.icon}</Box>
                                    <Typography variant="h6" sx={{ mb: 1 }}>{c.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{c.count} プロジェクト</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>            {/* 統計 */}
            <Box className="stats-section">
                <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                    <Typography variant="h4" className="section-title" sx={{ mb: 4 }}>プラットフォーム統計</Typography>
                    <Box sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-around",
                        mx: { xs: -1, sm: -2 } // ネガティブマージンで小さい画面でも均等配置
                    }}>
                        {stats.map((s) => (
                            <Box
                                key={s.label}
                                sx={{
                                    flex: { xs: "1 1 45%", sm: "1 1 40%", md: "1 1 22%" },
                                    m: { xs: 1, sm: 2 },
                                    p: 2
                                }}
                                className="stat-item"
                            >
                                <Typography variant="h3" className="stat-value">{s.value}</Typography>
                                <Typography variant="body1" className="stat-label">{s.label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>
        </div>
    );
};

export default HomePage;
