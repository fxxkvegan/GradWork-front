import React from "react";
import {
	Box,
	Container,
	Typography,
	Stack,
	Link,
	Divider,
	IconButton,
} from "@mui/material";
import { GitHub as GitHubIcon } from "@mui/icons-material";

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	return (
		<Box
			component="footer"
			sx={{
				backgroundColor: "grey.900",
				color: "white",
				mt: "auto", // 自動的に上マージンを最大化
				py: 4,
				position: "relative",
				bottom: 0,
				width: "100%",
			}}
		>
			<Container maxWidth="lg">
				<Stack spacing={3}>
					{/* メインフッターコンテンツ */}
					<Stack
						direction={{ xs: "column", md: "row" }}
						spacing={{ xs: 3, md: 6 }}
						justifyContent="space-between"
					>
						{/* ブランド情報 */}
						<Box>
							<Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
								Nice dig
							</Typography>
							<Typography
								variant="body2"
								color="grey.400"
								sx={{ maxWidth: 300 }}
							>
								開発者のための高品質なプロジェクトとツールを提供するプラットフォーム
							</Typography>
						</Box>

						{/* クイックリンク */}
						<Stack
							direction={{ xs: "row", sm: "row" }}
							spacing={{ xs: 1, sm: 4 }} // xs時の間隔を1に縮小
							sx={{
								flexWrap: { xs: "wrap", sm: "nowrap" },
								justifyContent: { xs: "space-between", sm: "flex-start" },
								width: "100%", // 幅を100%に設定
							}}
						>
							{/* サービス */}
							<Stack
								spacing={1}
								sx={{
									minWidth: { xs: "30%", sm: "auto" },
									flexShrink: 0, // 収縮を防ぐ
								}}
							>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: "bold",
										mb: 1,
										fontSize: { xs: "0.875rem", sm: "1rem" }, // モバイルで文字サイズ調整
									}}
								>
									サービス
								</Typography>
								<Link
									href="/projects"
									color="grey.400"
									underline="hover"
									variant="body2"
								>
									プロジェクト一覧
								</Link>
								<Link
									href="/categories"
									color="grey.400"
									underline="hover"
									variant="body2"
								>
									カテゴリ
								</Link>
								<Link
									href="/developer-services"
									color="grey.400"
									underline="hover"
									variant="body2"
								>
									開発者サービス
								</Link>
							</Stack>

							{/* サポート */}
							<Stack
								spacing={1}
								sx={{
									minWidth: { xs: "30%", sm: "auto" },
									flexShrink: 0, // 収縮を防ぐ
								}}
							>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: "bold",
										mb: 1,
										fontSize: { xs: "0.875rem", sm: "1rem" },
									}}
								>
									サポート
								</Typography>
								<Link
									href="/help"
									color="grey.400"
									underline="hover"
									variant="body2"
								>
									ヘルプセンター
								</Link>
								<Link
									href="/contact"
									color="grey.400"
									underline="hover"
									variant="body2"
								>
									お問い合わせ
								</Link>
								<Link
									href="/faq"
									color="grey.400"
									underline="hover"
									variant="body2"
								>
									よくある質問
								</Link>
							</Stack>

							{/* 法的情報 */}
							<Stack
								spacing={1}
								sx={{
									minWidth: { xs: "30%", sm: "auto" },
									flexShrink: 0, // 収縮を防ぐ
								}}
							>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: "bold",
										mb: 1,
										fontSize: { xs: "0.875rem", sm: "1rem" },
									}}
								>
									法的情報
								</Typography>
								<Link
									href="/legal"
									color="grey.400"
									underline="hover"
									variant="body2"
								>
									利用規約
								</Link>
								<Link
									href="/privacy"
									color="grey.400"
									underline="hover"
									variant="body2"
								>
									プライバシーポリシー
								</Link>
								<Link
									href="/cookies"
									color="grey.400"
									underline="hover"
									variant="body2"
								>
									Cookie ポリシー
								</Link>
							</Stack>
						</Stack>
					</Stack>

					<Divider sx={{ borderColor: "grey.700" }} />

					{/* フッター下部 */}
					<Stack
						direction={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems="center"
						spacing={2}
					>
						<Typography variant="body2" color="grey.400">
							© {currentYear} Nice dig
						</Typography>

						{/* ソーシャルメディアリンク */}
						<Stack direction="row" spacing={1}>
							<IconButton
								href="https://github.com"
								target="_blank"
								rel="noopener noreferrer"
								size="small"
								sx={{ color: "grey.400", "&:hover": { color: "white" } }}
							>
								<GitHubIcon fontSize="small" />
							</IconButton>
						</Stack>
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
};

export default Footer;
