import { Box } from "@mui/material";
import React from "react";
import Footer from "../pages/footer";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh", // ビューポート全体の高さを最低保証
			}}
		>
			{/* メインコンテンツエリア */}
			<Box component="main" sx={{ flex: 1 }}>
				{children}
			</Box>

			{/* フッター（常に下部に配置） */}
			<Footer />
		</Box>
	);
};

export default Layout;
