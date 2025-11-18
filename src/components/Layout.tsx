import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../pages/footer";

interface LayoutProps {
	children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
	const content = children ?? <Outlet />;

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
				{content}
			</Box>

			{/* フッター（常に下部に配置） */}
			<Footer />
		</Box>
	);
};

export default Layout;
