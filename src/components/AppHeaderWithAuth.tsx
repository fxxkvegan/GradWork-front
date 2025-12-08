import React from "react";
import { useAuth } from "../context/AuthContext";
import { useDmNotifications } from "../context/DmNotificationContext";
import { useNotifications } from "../context/NotificationContext";
import AppHeader from "./AppHeader";

interface AppHeaderWithAuthProps {
	activePath?: string;
}

const AppHeaderWithAuth: React.FC<AppHeaderWithAuthProps> = ({
	activePath,
}) => {
	const { isLoggedIn, user, logout } = useAuth();
	const { unreadCount: notificationUnreadCount } = useNotifications();
	const { unreadCount: dmUnreadCount } = useDmNotifications();

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
			dmUnreadCount={dmUnreadCount}
			notificationUnreadCount={notificationUnreadCount}
		/>
	);
};

export default AppHeaderWithAuth;
