import React, { useState } from "react";
import {
	Container,
	Typography,
	Box,
	Card,
	CardMedia,
	CardContent,
	Chip,
	IconButton,
	Button,
	Tooltip,
} from "@mui/material";
import {
	Favorite as FavoriteIcon,
	Star as StarIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import AppHeader from "../component/AppHeader";
import * as favorites from "../utils/favorites";

interface Project {
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

const ProjectList: React.FC = () => {
	const [params] = useSearchParams();
	const category = params.get("category") || "すべて";

	const dummyProjects: Project[] = [
		{
			id: 0,
			title: "Webアプリ開発テンプレート",
			subtitle: "React + TypeScriptですぐに始められるボイラープレート",
			img: "https://picsum.photos/400/300?1",
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
			img: "https://picsum.photos/400/300?2",
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
			img: "https://picsum.photos/400/300?3",
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
			img: "https://picsum.photos/400/300?4",
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
			img: "https://picsum.photos/400/300?5",
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
			img: "https://picsum.photos/400/300?6",
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
			img: "https://picsum.photos/400/300?7",
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
			img: "https://picsum.photos/400/300?8",
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
			img: "https://picsum.photos/400/300?9",
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
			img: "https://picsum.photos/400/300?10",
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
			img: "https://picsum.photos/400/300?11",
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
			img: "https://picsum.photos/400/300?12",
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
			img: "https://picsum.photos/400/300?13",
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
			img: "https://picsum.photos/400/300?14",
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
			img: "https://picsum.photos/400/300?15",
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
			img: "https://picsum.photos/400/300?16",
			category: "マーケティング",
			rating: 4.4,
			price: 5800,
			downloads: 1150,
			tags: ["マーケティング", "SEO", "分析"],
		},
	];

	const filteredProjects =
		category === "すべて"
			? dummyProjects
			: dummyProjects.filter((p) => p.category === category);

	return (
		<>
			<AppHeader activePath="/projects" />
			<Container
				maxWidth="lg"
				sx={{ pt: 5, px: { xs: 2, sm: 3, md: 4 }, pb: 8 }}
			>
				<div style={{ position: "relative", paddingTop: 30 }}>
					<Typography variant="h4" gutterBottom>
						{category}プロジェクト一覧
					</Typography>
				</div>

				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
						gap: 2,
					}}
				>
					{filteredProjects.map((p) => (
						<ProjectCard key={p.id} project={p} />
					))}
				</Box>
			</Container>
		</>
	);
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
	const [isFavorite, setIsFavorite] = useState(() =>
		favorites.isFavorite(project.id),
	);

	const toggleFavorite = (event: React.MouseEvent) => {
		event.preventDefault();
		const newState = favorites.toggleFavorite(project.id);
		setIsFavorite(newState);
	};

	// タグを3個までに制限
	const visibleTags = project.tags.slice(0, 3);
	const extraTagCount = project.tags.length - visibleTags.length;

	return (
		<Card
			sx={{
				borderRadius: 2,
				boxShadow: 1,
				overflow: "hidden",
				transition: "transform 0.15s ease, box-shadow 0.15s ease",
				"&:hover": {
					transform: "translateY(-3px)",
					boxShadow: 3,
				},
			}}
		>
			{/* 画像部分 */}
			<Box sx={{ position: "relative" }}>
				<CardMedia
					component="img"
					image={project.img}
					alt={project.title}
					sx={{ height: 90, objectFit: "cover" }}
				/>
				<Chip
					label={project.category}
					size="small"
					sx={{
						position: "absolute",
						top: 5,
						left: 5,
						backgroundColor: "white",
						fontWeight: "bold",
						fontSize: "0.7rem",
					}}
				/>
				<IconButton
					onClick={toggleFavorite}
					size="small"
					sx={{
						position: "absolute",
						top: 5,
						right: 5,
						backgroundColor: "rgba(255,255,255,0.9)",
						"& svg": {
							stroke: isFavorite ? "#e91e63" : "#757575",
							fill: isFavorite ? "#e91e63" : "transparent",
						},
					}}
				>
					<FavoriteIcon fontSize="small" />
				</IconButton>
			</Box>

			{/* 内容部分 */}
			<CardContent sx={{ p: 1 }}>
				<Tooltip title={project.title}>
					<Typography
						variant="subtitle2"
						fontWeight="bold"
						noWrap
						sx={{ lineHeight: 1.3 }}
					>
						{project.title}
					</Typography>
				</Tooltip>
				<Typography variant="caption" color="text.secondary" noWrap>
					{project.subtitle}
				</Typography>

				<Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
					<StarIcon fontSize="small" sx={{ mr: 0.3 }} />
					<Typography variant="caption">{project.rating}</Typography>
					<Typography variant="caption" sx={{ ml: "auto" }}>
						{project.downloads} DL
					</Typography>
				</Box>

				<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.3, mt: 0.5 }}>
					{visibleTags.map((t) => (
						<Chip
							key={t}
							label={t}
							size="small"
							variant="outlined"
							sx={{ fontSize: "0.65rem" }}
						/>
					))}
					{extraTagCount > 0 && (
						<Chip
							label={`+${extraTagCount}`}
							size="small"
							variant="outlined"
							sx={{ fontSize: "0.65rem" }}
						/>
					)}
				</Box>

				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mt: 0.8,
					}}
				>
					<Typography variant="body2" fontWeight="bold" fontSize="0.85rem">
						¥{project.price.toLocaleString()}
					</Typography>
					<Button
						size="small"
						variant="text"
						sx={{ fontSize: "0.65rem", p: 0.3, minWidth: "auto" }}
					>
						詳細
					</Button>
				</Box>
			</CardContent>
		</Card>
	);
};

export default ProjectList;
