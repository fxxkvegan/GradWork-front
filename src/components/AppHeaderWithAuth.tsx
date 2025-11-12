import React from "react";
import { useAuth } from "../context/AuthContext";
import AppHeader from "./AppHeader";

interface AppHeaderWithAuthProps {
	activePath?: string;
}

const AppHeaderWithAuth: React.FC<AppHeaderWithAuthProps> = ({
	activePath,
}) => {
	const { isLoggedIn, user, logout } = useAuth();

	const handleLogout = () => {
		logout();
	};

	return (
		<AppHeader
			activePath={activePath}
			isLoggedIn={isLoggedIn}
			userName={user?.name}
			avatarUrl={user?.avatarUrl ?? undefined}
			onLogout={handleLogout}
			messageCount={0}
		/>
	);
};

export default AppHeaderWithAuth;
