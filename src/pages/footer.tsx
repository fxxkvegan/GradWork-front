import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import React from "react";

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	return (
		<Box
			component="footer"
			sx={{
				backgroundColor: "grey.900",
				color: "white",
				mt: "auto",
				py: 4,
				position: "relative",
				bottom: 0,
				width: "100%",
			}}
		>
			<Container maxWidth="lg">
				<Stack spacing={3}>
					{/* メインフッターコンテンツ（ブランド情報のみ） */}
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
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
};

export default Footer;
