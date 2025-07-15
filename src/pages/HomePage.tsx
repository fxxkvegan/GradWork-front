import React, { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import AppHeader from "../component/AppHeader";
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
} from "@mui/icons-material";
import * as favorites from "../utils/favorites";

import "./HomePage.css";
import "./carousel-extra.css";

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
            } catch (error: any) {
                console.warn(`${endpoint} failed, using fallback`, error);
                if (!cancelled) setError(error.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [endpoint]);

    return { data, loading, error };
};

/* ---------- プロジェクトカード ---------- */
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    // お気に入り状態の管理
    const [isFavorite, setIsFavorite] = useState(() => favorites.isFavorite(project.id));

    // お気に入りトグル処理
    const handleFavoriteClick = (event: React.MouseEvent) => {
        event.preventDefault();
        const newState = favorites.toggleFavorite(project.id);
        setIsFavorite(newState);
    };

    return (
        <Card className="project-card">
            <Box className="card-image-container">
                <CardMedia component="img" image={project.img} alt={project.title} />
                <Box className="card-overlay">
                    <Chip label={project.category} size="small" className="category-chip" />
                </Box>                <IconButton
                    size="small"
                    className="favorite-button"
                    onClick={handleFavoriteClick}
                    sx={{
                        opacity: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.9) !important',
                        '&:hover': {
                            backgroundColor: 'white !important',
                        },
                        '& svg': {
                            stroke: isFavorite ? '#e91e63' : '#757575',
                            strokeWidth: 1.5,
                            fill: isFavorite ? '#e91e63' : 'transparent',
                        },
                        '&:hover svg': {
                            stroke: '#e91e63',
                        }
                    }}
                >
                    <FavoriteIcon fontSize="small" />
                </IconButton>
            </Box>

            <CardContent className="card-content">
                <Box className="card-header">
                    <Typography variant="subtitle2">{project.downloads} DL</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <StarIcon fontSize="small" />
                        <Typography variant="subtitle2">{project.rating}</Typography>
                    </Box>
                </Box>

                <Typography variant="subtitle1" fontWeight="bold">{project.title}</Typography>
                <Typography variant="body2" className="project-description">{project.subtitle}</Typography>

                <Box className="tags-container">
                    {project.tags.map((t) => (
                        <Chip key={t} label={t} size="small" variant="outlined" className="tag-chip" />
                    ))}
                </Box>

                <Box className="card-footer">
                    <Typography variant="h6" className="price-text">¥{project.price.toLocaleString()}</Typography>
                    <Button size="small" variant="contained" disableElevation className="view-button">
                        詳細を見る
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

/* ---------- HomePage ---------- */
const HomePage: React.FC = () => {    /* ダミー (API 失敗時用) */    const dummyProjects: Project[] = [
    {
        id: 0,
        title: "Webアプリ開発テンプレート",
        subtitle: "React + TypeScriptですぐに始められるボイラープレート",
        img: "https://picsum.photos/500/600?rand=1",
        category: "Web開発",
        rating: 4.8,
        price: 2500,
        downloads: 1250,
        tags: ["React", "TypeScript", "MUI"],
    },
    {
        id: 1,
        title: "AIチャットボット",
        subtitle: "自然言語処理を用いた高度な会話システム",
        img: "https://picsum.photos/500/600?rand=2",
        category: "AI",
        rating: 4.5,
        price: 5000,
        downloads: 870,
        tags: ["AI", "NLP", "Python"],
    },
    {
        id: 2,
        title: "モバイルアプリUI/UXキット",
        subtitle: "スマートフォンアプリ用の美しいデザインテンプレート",
        img: "https://picsum.photos/500/600?rand=3",
        category: "デザイン",
        rating: 4.9,
        price: 3800,
        downloads: 2100,
        tags: ["UI/UX", "モバイル", "Figma"],
    },
    {
        id: 3,
        title: "データ分析ダッシュボード",
        subtitle: "ビジネスインサイトを可視化するための高度な分析ツール",
        img: "https://picsum.photos/500/600?rand=4",
        category: "データ",
        rating: 4.6,
        price: 4200,
        downloads: 950,
        tags: ["ダッシュボード", "分析", "BI"],
    },
    {
        id: 4,
        title: "クラウドストレージAPI",
        subtitle: "安全で高速なファイル保存・共有システム",
        img: "https://picsum.photos/500/600?rand=5",
        category: "バックエンド",
        rating: 4.7,
        price: 3500,
        downloads: 1560,
        tags: ["API", "クラウド", "セキュリティ"],
    },
    {
        id: 5,
        title: "e-コマースプラットフォーム",
        subtitle: "オンラインショップ構築のための完全なソリューション",
        img: "https://picsum.photos/500/600?rand=6",
        category: "ビジネス",
        rating: 4.4,
        price: 6500,
        downloads: 780,
        tags: ["EC", "ショップ", "決済"],
    },
    {
        id: 6,
        title: "SNS連携ツール",
        subtitle: "複数のソーシャルメディアを一元管理",
        img: "https://picsum.photos/500/600?rand=7",
        category: "マーケティング",
        rating: 4.2,
        price: 2800,
        downloads: 1320,
        tags: ["SNS", "マーケティング", "自動化"],
    },
    {
        id: 7,
        title: "3Dゲームアセット",
        subtitle: "高品質な3Dモデルとテクスチャセット",
        img: "https://picsum.photos/500/600?rand=8",
        category: "ゲーム",
        rating: 4.9,
        price: 4800,
        downloads: 630,
        tags: ["3D", "ゲーム", "Unity"],
    },
    {
        id: 8,
        title: "マシンラーニングモデル",
        subtitle: "画像認識と自然言語処理の最適化済みモデル",
        img: "https://picsum.photos/500/600?rand=9",
        category: "AI",
        rating: 4.7,
        price: 7500,
        downloads: 420,
        tags: ["機械学習", "TensorFlow", "Python"],
    },
    {
        id: 9,
        title: "ARコンテンツ制作キット",
        subtitle: "拡張現実アプリケーション開発のためのフレームワーク",
        img: "https://picsum.photos/500/600?rand=10",
        category: "AR/VR",
        rating: 4.3,
        price: 5200,
        downloads: 380,
        tags: ["AR", "Unity", "モバイル"],
    },
    {
        id: 10,
        title: "IoTセンサーネットワーク",
        subtitle: "スマートホーム向けセンサー連携システム",
        img: "https://picsum.photos/500/600?rand=11",
        category: "IoT",
        rating: 4.6,
        price: 4600,
        downloads: 560,
        tags: ["IoT", "センサー", "組み込み"],
    },
    {
        id: 11,
        title: "ブロックチェーンウォレット",
        subtitle: "安全な暗号資産管理のためのウォレットアプリ",
        img: "https://picsum.photos/500/600?rand=12",
        category: "ブロックチェーン",
        rating: 4.5,
        price: 3900,
        downloads: 720,
        tags: ["ブロックチェーン", "ウォレット", "セキュリティ"],
    },
    {
        id: 12,
        title: "音声認識ライブラリ",
        subtitle: "多言語対応の高精度音声テキスト変換エンジン",
        img: "https://picsum.photos/500/600?rand=13",
        category: "音声処理",
        rating: 4.8,
        price: 4300,
        downloads: 890,
        tags: ["音声認識", "AI", "多言語"],
    },
    {
        id: 13,
        title: "デザインシステム",
        subtitle: "一貫性のあるUIを実現するためのコンポーネントライブラリ",
        img: "https://picsum.photos/500/600?rand=14",
        category: "デザイン",
        rating: 4.7,
        price: 3200,
        downloads: 1760,
        tags: ["デザインシステム", "UI", "コンポーネント"],
    },
    {
        id: 14,
        title: "サイバーセキュリティツール",
        subtitle: "ネットワーク脆弱性診断と対策の総合パッケージ",
        img: "https://picsum.photos/500/600?rand=15",
        category: "セキュリティ",
        rating: 4.9,
        price: 8500,
        downloads: 430,
        tags: ["セキュリティ", "診断", "対策"],
    },
    {
        id: 15,
        title: "デジタルマーケティングスイート",
        subtitle: "SEO、SNS、広告を一元管理するマーケティングツール",
        img: "https://picsum.photos/500/600?rand=16",
        category: "マーケティング",
        rating: 4.4,
        price: 5800,
        downloads: 1150,
        tags: ["マーケティング", "SEO", "分析"],
    }
];
    const dummyCategories: Category[] = [
        { name: "Web開発", icon: <CodeIcon />, count: 28 },
        { name: "AI", icon: <img src="https://img.icons8.com/ios/50/artificial-intelligence.png" alt="AI" width="24" height="24" />, count: 15 },
        { name: "デザイン", icon: <img src="https://img.icons8.com/ios/50/design--v1.png" alt="デザイン" width="24" height="24" />, count: 22 },
        { name: "データ", icon: <img src="https://img.icons8.com/ios/50/database.png" alt="データ" width="24" height="24" />, count: 18 },
        { name: "バックエンド", icon: <img src="https://img.icons8.com/ios/50/server.png" alt="バックエンド" width="24" height="24" />, count: 20 },
        { name: "ビジネス", icon: <img src="https://img.icons8.com/ios/50/business.png" alt="ビジネス" width="24" height="24" />, count: 14 },
        { name: "マーケティング", icon: <img src="https://img.icons8.com/ios/50/commercial.png" alt="マーケティング" width="24" height="24" />, count: 17 },
        { name: "ゲーム", icon: <img src="https://img.icons8.com/ios/50/controller.png" alt="ゲーム" width="24" height="24" />, count: 12 },
        { name: "AR/VR", icon: <img src="https://img.icons8.com/ios/50/virtual-reality.png" alt="AR/VR" width="24" height="24" />, count: 8 },
        { name: "IoT", icon: <img src="https://img.icons8.com/ios/50/iot-sensor.png" alt="IoT" width="24" height="24" />, count: 11 },
        { name: "ブロックチェーン", icon: <img src="https://img.icons8.com/ios/50/blockchain-technology.png" alt="ブロックチェーン" width="24" height="24" />, count: 9 },
        { name: "セキュリティ", icon: <img src="https://img.icons8.com/ios/50/shield.png" alt="セキュリティ" width="24" height="24" />, count: 13 }
    ];
    const dummyStats: Stat[] = [
        { value: "187", label: "プロジェクト" },
        { value: "5,420", label: "ダウンロード" },
        { value: "842", label: "ユーザー" },
        { value: "128", label: "開発者" }
    ];    /* API 取得 - 先に取得しておくことで初期化前アクセスエラーを防ぐ */    const { data: projects, loading: loadingP } = useApiData<Project[]>("/projects", dummyProjects);
    const { data: categories } = useApiData<Category[]>("/categories", dummyCategories);
    const { data: stats } = useApiData<Stat[]>("/stats", dummyStats);    /* カルーセルの実装 - 完全シームレス無限ループ版 */
    const carouselRef = useRef<HTMLDivElement | null>(null);
    const intervalRef = useRef<number | null>(null);
    const isScrollingRef = useRef(false);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const [initialized, setInitialized] = useState(false);
    const [activeItemIndex, setActiveItemIndex] = useState(0);

    // カルーセルの初期化と無限スクロール
    useEffect(() => {
        if (!carouselRef.current || !projects.length) return;

        const carouselElement = carouselRef.current;

        // 初期化処理（重要: 一度だけ実行）
        if (!initialized) {
            // カルーセルを空にして、項目を5倍に複製（前後に2セットずつ追加）して配置
            carouselElement.innerHTML = '';

            // プロジェクト配列を5回繰り返してカルーセルに追加（前後の余裕を増やす）
            const projectsArray = Array(5).fill(projects).flat();

            projectsArray.forEach((project, index) => {
                const item = document.createElement('div');
                item.className = `carousel-item ${index % projects.length === activeItemIndex ? 'active' : ''}`;
                item.setAttribute('data-index', String(index % projects.length));

                // ProjectCardコンポーネントのHTMLを直接生成
                item.innerHTML = `
                    <div class="project-card">
                        <div class="card-image-container">
                            <img src="${project.img}" alt="${project.title}" class="MuiCardMedia-root MuiCardMedia-media MuiCardMedia-img" />
                            <div class="card-overlay">
                                <div class="MuiChip-root MuiChip-filled MuiChip-sizeSmall category-chip">
                                    <span class="MuiChip-label MuiChip-labelSmall">${project.category}</span>
                                </div>
                            </div>
                            <button class="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeSmall favorite-button">
                                <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall" focusable="false" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="MuiCardContent-root card-content">
                            <div class="card-header">
                                <p class="MuiTypography-root MuiTypography-subtitle2">${project.downloads} DL</p>
                                <div style="display: flex; align-items: center; gap: 0.5px">
                                    <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall" focusable="false" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                                    </svg>
                                    <p class="MuiTypography-root MuiTypography-subtitle2">${project.rating}</p>
                                </div>
                            </div>
                            <h6 class="MuiTypography-root MuiTypography-subtitle1" style="font-weight: bold">${project.title}</h6>
                            <p class="MuiTypography-root MuiTypography-body2 project-description">${project.subtitle}</p>                            <div class="tags-container">
                                ${project.tags.map((t: string) => `
                                    <div class="MuiChip-root MuiChip-outlined MuiChip-sizeSmall tag-chip">
                                        <span class="MuiChip-label MuiChip-labelSmall">${t}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="card-footer">
                                <h6 class="MuiTypography-root MuiTypography-h6 price-text">¥${project.price.toLocaleString()}</h6>
                                <button class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeSmall MuiButton-containedSizeSmall view-button MuiButton-disableElevation">
                                    <span class="MuiButton-label">詳細を見る</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                carouselElement.appendChild(item);
            });

            // 初期スクロール位置を中央セットの先頭に設定
            const itemWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--item-width'));
            const gapWidth = 20; // CSS gap値
            const singleItemWidth = itemWidth + gapWidth;
            const initialScrollPosition = singleItemWidth * projects.length * 2; // 3番目のセットの先頭

            // scrollBehaviorを一時的に無効化して、初期位置を即座に設定
            carouselElement.style.scrollBehavior = 'auto';
            carouselElement.scrollLeft = initialScrollPosition;

            // スムーズスクロールを有効に戻す（少し遅延）
            setTimeout(() => {
                carouselElement.style.scrollBehavior = 'smooth';
            }, 100);

            setInitialized(true);
        }

        // 自動スクロール機能
        const startAutoScroll = () => {
            // 既存のインターバルをクリア
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            // スクロール速度を調整可能に
            const scrollSpeed = 0.7; // 1ピクセル/フレームよりやや遅く

            intervalRef.current = window.setInterval(() => {
                if (!carouselElement || isScrollingRef.current || isDraggingRef.current) return;

                // 少しずつスクロールを進める
                carouselElement.scrollLeft += scrollSpeed;

                // アクティブなアイテムを更新
                updateActiveItem();

                // 無限ループの位置チェックと調整
                checkAndResetPosition();
            }, 16); // 約60FPS
        };

        // 無限ループのためのスクロール位置チェックと調整
        const checkAndResetPosition = () => {
            if (!carouselElement || isScrollingRef.current) return;

            const itemWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--item-width'));
            const gapWidth = 20;
            const totalItemWidth = itemWidth + gapWidth;
            const itemsPerSet = projects.length;
            const setWidth = totalItemWidth * itemsPerSet;

            const currentScroll = carouselElement.scrollLeft;

            // 右端（4番目のセット以降）に到達したら、中央のセットの対応位置にリセット
            if (currentScroll >= setWidth * 3.5) {
                isScrollingRef.current = true;

                // スクロール位置を調整（1セット分戻す）
                carouselElement.style.scrollBehavior = 'auto';
                carouselElement.scrollLeft -= setWidth;

                // フラグをリセットして、スムーズスクロールを復活
                setTimeout(() => {
                    carouselElement.style.scrollBehavior = 'smooth';
                    isScrollingRef.current = false;
                }, 10);
            }
            // 左端（1番目のセット以前）に到達したら、中央のセットの対応位置にリセット
            else if (currentScroll <= setWidth * 0.5) {
                isScrollingRef.current = true;

                // スクロール位置を調整（1セット分進める）
                carouselElement.style.scrollBehavior = 'auto';
                carouselElement.scrollLeft += setWidth;

                // フラグをリセットして、スムーズスクロールを復活
                setTimeout(() => {
                    carouselElement.style.scrollBehavior = 'smooth';
                    isScrollingRef.current = false;
                }, 10);
            }
        };

        // アクティブなアイテムの更新
        const updateActiveItem = () => {
            if (!carouselElement) return;

            const itemWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--item-width'));
            const gapWidth = 20;
            const itemFullWidth = itemWidth + gapWidth;
            const scrollPosition = carouselElement.scrollLeft;
            const centerPosition = scrollPosition + carouselElement.clientWidth / 2;

            // スクロール位置に基づいて、中央に表示されているアイテムのインデックスを計算
            const rawIndex = Math.floor(centerPosition / itemFullWidth);
            const newActiveItemIndex = rawIndex % projects.length;

            // 変更があった場合のみステートを更新（不要な再レンダリングを防止）
            if (newActiveItemIndex !== activeItemIndex) {
                setActiveItemIndex(newActiveItemIndex);

                // DOM要素のクラスも直接更新（Reactの再レンダリングを待たずに視覚効果を即時適用）
                const items = carouselElement.querySelectorAll('.carousel-item');
                items.forEach(item => {
                    if (parseInt(item.getAttribute('data-index') || '0') === newActiveItemIndex) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        };

        // マウスイベントハンドラー - 自動スクロール制御
        const pauseScroll = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        const resumeScroll = () => {
            if (!intervalRef.current && !isDraggingRef.current) {
                startAutoScroll();
            }
        };

        // ドラッグ操作のイベントハンドラー
        const handleMouseDown = (event: MouseEvent) => {
            isDraggingRef.current = true;
            startXRef.current = event.pageX - carouselElement.offsetLeft;
            scrollLeftRef.current = carouselElement.scrollLeft;
            carouselElement.classList.add('dragging');

            // 自動スクロールを一時停止
            pauseScroll();
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!isDraggingRef.current) return;

            const x = event.pageX - carouselElement.offsetLeft;
            const walk = (x - startXRef.current) * 2; // スクロール倍率
            carouselElement.scrollLeft = scrollLeftRef.current - walk;

            // ドラッグ中もアクティブアイテムを更新
            updateActiveItem();
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            carouselElement.classList.remove('dragging');

            // 無限ループのための位置チェックと調整
            checkAndResetPosition();

            // 自動スクロールを再開
            resumeScroll();
        };

        const handleMouseLeave = () => {
            if (isDraggingRef.current) {
                handleMouseUp(); // ドラッグ終了処理も実行
            } else {
                resumeScroll(); // 通常の離脱時の処理
            }
        };

        // スクロールイベントハンドラー - ループのための位置調整
        const handleScroll = () => {
            if (!carouselElement || isScrollingRef.current) return;

            // アクティブなアイテムを更新
            updateActiveItem();

            // 手動スクロール時にも無限ループのチェックを行う
            if (!isDraggingRef.current) {
                checkAndResetPosition();
            }
        };

        // イベントリスナーの登録
        carouselElement.addEventListener('mouseenter', pauseScroll);
        carouselElement.addEventListener('mouseleave', handleMouseLeave);
        carouselElement.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        carouselElement.addEventListener('scroll', handleScroll);

        // タッチイベントのサポート
        const handleTouchStart = (event: TouchEvent) => {
            isDraggingRef.current = true;
            startXRef.current = event.touches[0].pageX - carouselElement.offsetLeft;
            scrollLeftRef.current = carouselElement.scrollLeft;
            carouselElement.classList.add('dragging');
            pauseScroll();
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (!isDraggingRef.current) return;
            event.preventDefault(); // ページ全体のスクロールを防止
            const x = event.touches[0].pageX - carouselElement.offsetLeft;
            const walk = (x - startXRef.current) * 2;
            carouselElement.scrollLeft = scrollLeftRef.current - walk;
            updateActiveItem();
        };

        const handleTouchEnd = () => {
            isDraggingRef.current = false;
            carouselElement.classList.remove('dragging');
            checkAndResetPosition();
            resumeScroll();
        };

        carouselElement.addEventListener('touchstart', handleTouchStart);
        carouselElement.addEventListener('touchmove', handleTouchMove);
        carouselElement.addEventListener('touchend', handleTouchEnd);

        // 自動スクロールの開始
        startAutoScroll();

        // クリーンアップ
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            carouselElement.removeEventListener('mouseenter', pauseScroll);
            carouselElement.removeEventListener('mouseleave', handleMouseLeave);
            carouselElement.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            carouselElement.removeEventListener('scroll', handleScroll);
            carouselElement.removeEventListener('touchstart', handleTouchStart);
            carouselElement.removeEventListener('touchmove', handleTouchMove);
            carouselElement.removeEventListener('touchend', handleTouchEnd);
        };
    }, [projects, initialized, activeItemIndex]); return (
        <div className="homepage">
            <AppHeader activePath="/" />

            {/* ヒーロー */}
            <Box className="hero-section">
                <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 5 }}>
                    <Box className="hero-content">
                        <Typography variant="h2" className="hero-title">
                            開発ちゅ♡
                        </Typography>
                    </Box>
                </Container>
            </Box>            {/* 注目のプロジェクト */}
            <Container maxWidth="lg" className="featured-section" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                <Typography variant="h4" className="section-title">注目のプロジェクト</Typography>                {loadingP ? (
                    <Box className="loading-container"><CircularProgress /></Box>
                ) : projects.length === 0 ? (
                    <Alert severity="info" className="api-error-alert">現在、表示できるプロジェクトがありません。</Alert>
                ) : (<Box className="carousel-section" id="projectCarousel" sx={{ mt: 5, mb: 5 }}>                        <Box className="carousel-container">
                    <Box
                        className={`carousel-track ${isScrollingRef.current ? 'scrolling' : ''}`}
                        ref={carouselRef}
                    >
                        {/* 初期レンダリングのためのプレースホルダー - 実際の内容はJSで動的に生成 */}
                        {/* 初期マウント時のみ表示され、useEffectで置き換えられる */}
                        {!initialized && projects.map((project) => (
                            <Box
                                key={`placeholder-${project.id}`}
                                className="carousel-item"
                                data-index={project.id % projects.length}
                            >
                                <ProjectCard project={project} />
                            </Box>
                        ))}
                    </Box>
                </Box>
                </Box>
                )}
            </Container>

            {/* カテゴリ */}
            <Box className="category-section">
                <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                    <Typography variant="h4" className="section-title">カテゴリから探す</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1, sm: 2, md: 3 }, mt: 4 }}>
                        {categories.map((c) => (
                            <Box key={c.name} sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 30%", lg: "1 1 23%" }, mb: 2 }} className="category-item">
                                <Button
                                    variant="contained"
                                    className="category-content"
                                    fullWidth
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        height: '100%',
                                        p: 3,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        backgroundColor: 'white',
                                        color: 'text.primary',
                                        '&:hover': {
                                            backgroundColor: 'grey.100',
                                        }
                                    }}
                                >
                                    <Box sx={{ fontSize: '2rem' }}>{c.icon}</Box>
                                    <Typography variant="h6">{c.name}</Typography>
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>
        </div>
    );
};

export default HomePage;
