import React from "react";
import AppHeader from "./AppHeader";
import { useAuth } from "../context/AuthContext";

interface AppHeaderWithAuthProps {
	activePath?: string;
}

// AuthContextを使用するAppHeaderのラッパーコンポーネント
const AppHeaderWithAuth: React.FC<AppHeaderWithAuthProps> = ({
	activePath,
}) => {
	const { isLoggedIn, user, logout } = useAuth();

	// ログアウト処理
	const handleLogout = () => {
		logout();
	};

	return (
		<AppHeader
			activePath={activePath}
			isLoggedIn={isLoggedIn}
			userName={user?.displayName || user?.username}
			avatarUrl={user?.avatar}
			onLogout={handleLogout}
			messageCount={0}
		/>
	);
};

export default AppHeaderWithAuth;
