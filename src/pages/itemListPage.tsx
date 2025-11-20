import {
	Box,
	Button,
	Card,
	CardContent,
	CardMedia,
	Chip,
	Container,
	Grid,
	Rating,
	Typography,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

// デモ用プロジェクトデータ
const demoProjects = [
	{
		id: 1,
		title: "React E-commerce Platform",
		description: "モダンなReactとTypeScriptで構築されたECサイト",
		shortDescription: "レスポンシブ対応のECプラットフォーム",
		image: "/nice_dig.png",
		price: 15000,
		isFree: false,
		rating: { average: 4.5, count: 128 },
		tags: ["React", "TypeScript", "Material-UI", "Redux"],
	},
	{
		id: 2,
		title: "Vue.js Dashboard",
		description: "管理者用ダッシュボードテンプレート",
		shortDescription: "Vue.js製の管理画面テンプレート",
		image: "/nice_dig.png",
		price: 12000,
		isFree: false,
		rating: { average: 4.2, count: 89 },
		tags: ["Vue.js", "Vuetify", "Chart.js", "API"],
	},
	{
		id: 3,
		title: "Node.js API Starter",
		description: "RESTful API開発のスターターキット",
		shortDescription: "Node.js APIのボイラープレート",
		image: "/nice_dig.png",
		price: 0,
		isFree: true,
		rating: { average: 4.8, count: 156 },
		tags: ["Node.js", "Express", "MongoDB", "JWT"],
	},
];

const ItemListPage: React.FC = () => {
	const navigate = useNavigate();

	const handleViewDetails = (projectId: number) => {
		navigate(`/item/${projectId}`);
	};

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" component="h1" gutterBottom align="center">
				プロジェクト一覧
			</Typography>
			<Typography
				variant="body1"
				align="center"
				color="text.secondary"
				paragraph
			>
				厳選されたプロジェクトテンプレートとツールをご覧ください
			</Typography>

			<Grid container spacing={3} sx={{ mt: 2 }}>
				{demoProjects.map((project) => (
					<Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
						<Card
							sx={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
								transition:
									"transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
								"&:hover": {
									transform: "translateY(-4px)",
									boxShadow: 4,
								},
							}}
						>
							<CardMedia
								component="img"
								height="200"
								image={project.image}
								alt={project.title}
								sx={{ objectFit: "cover" }}
							/>
							<CardContent
								sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
							>
								<Typography variant="h6" component="h2" gutterBottom>
									{project.title}
								</Typography>
								<Typography variant="body2" color="text.secondary" paragraph>
									{project.shortDescription}
								</Typography>

								{/* 評価 */}
								<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
									<Rating
										value={project.rating.average}
										precision={0.1}
										readOnly
										size="small"
									/>
									<Typography variant="caption" sx={{ ml: 1 }}>
										({project.rating.count})
									</Typography>
								</Box>

								{/* タグ */}
								<Box sx={{ mb: 2 }}>
									{project.tags.slice(0, 3).map((tag, index) => (
										<Chip
											key={index}
											label={tag}
											size="small"
											sx={{ mr: 0.5, mb: 0.5 }}
										/>
									))}
								</Box>

								<Box sx={{ mt: "auto" }}>
									{/* 価格 */}
									<Typography variant="h6" color="primary" gutterBottom>
										{project.isFree
											? "無料"
											: `¥${project.price.toLocaleString()}`}
									</Typography>

									{/* アクションボタン */}
									<Button
										variant="contained"
										fullWidth
										onClick={() => handleViewDetails(project.id)}
									>
										詳細を見る
									</Button>
								</Box>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
		</Container>
	);
};

export default ItemListPage;
