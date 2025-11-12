import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
	IconButton,
	Drawer,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
	Badge,
	Avatar,
	Box,
	Typography,
	SvgIcon,
} from "@mui/material";
import {
	PersonOutline,
	Article,
	Message,
	Login,
	Logout,
	Settings,
	Notifications,
} from "@mui/icons-material";
import styles from "./UserMenu.module.css";

/* ---------- GitHub Octocat SVG ---------- */
const GitHubIcon: React.FC<React.ComponentProps<typeof SvgIcon>> = (props) => (
	<SvgIcon {...props}>
		<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
	</SvgIcon>
);

/* ---------- Props ---------- */
interface UserMenuProps {
	isLoggedIn: boolean;
	messageCount?: number;
	onLogout?: () => void;
	userName?: string;
	avatarUrl?: string;
}

/* ---------- Component ---------- */
const UserMenu: React.FC<UserMenuProps> = ({
	isLoggedIn = false,
	messageCount = 0,
	onLogout,
	userName = "ゲスト",
	avatarUrl,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleToggle = () => setIsOpen((prev) => !prev);
	const handleClose = () => setIsOpen(false);
	const handleLogout = () => {
		onLogout?.();
		handleClose();
	};

	return (
		<>
			{/* ------ Avatar Button ------ */}
			<IconButton
				onClick={handleToggle}
				aria-label="User menu"
				size="small"
				className={styles.avatarButton}
			>
				{isLoggedIn ? (
					<Badge
						badgeContent={messageCount}
						color="error"
						invisible={messageCount === 0}
						overlap="circular"
					>
						{avatarUrl ? (
							<Avatar
								src={avatarUrl}
								alt={userName}
								sx={{ width: 30, height: 30 }}
							/>
						) : (
							<GitHubIcon sx={{ color: "#fff", width: 30, height: 30 }} />
						)}
					</Badge>
				) : (
					<PersonOutline sx={{ color: "#fff" }} />
				)}
			</IconButton>

			{/* ------ Drawer ------ */}
			<Drawer
				anchor="right"
				open={isOpen}
				onClose={handleClose}
				PaperProps={{
					sx: {
						width: 280,
						backgroundColor: "#1d1d1f",
						color: "white",
						p: 0,
					},
				}}
			>
				{/* ------ User Header (only logged in) ------ */}
				{isLoggedIn && (
					<Box className={styles.userHeader}>
						{avatarUrl ? (
							<Avatar
								src={avatarUrl}
								alt={userName}
								sx={{ width: 60, height: 60 }}
							/>
						) : (
							<Avatar sx={{ width: 60, height: 60, bgcolor: "#24292e" }}>
								<GitHubIcon sx={{ color: "#fff", width: 40, height: 40 }} />
							</Avatar>
						)}
						<Box sx={{ ml: 2 }}>
							<Typography variant="h6" className={styles.userName}>
								{userName}
							</Typography>
							<Typography variant="body2" className={styles.userStatus}>
								オンライン
							</Typography>
						</Box>
					</Box>
				)}
				{/* ------ Menu List ------ */}{" "}
				<List>
					{isLoggedIn ? (
						<>
							<ListItemButton
								component={RouterLink}
								to="/my-posts"
								onClick={handleClose}
							>
								<ListItemIcon sx={{ color: "rgba(255,255,255,0.7)" }}>
									<Article />
								</ListItemIcon>
								<ListItemText primary="あなたの投稿一覧" />
							</ListItemButton>

							<ListItemButton
								component={RouterLink}
								to="/my-posts/messages"
								onClick={handleClose}
							>
								<ListItemIcon sx={{ color: "rgba(255,255,255,0.7)" }}>
									<Badge
										badgeContent={messageCount}
										color="error"
										invisible={messageCount === 0}
									>
										<Message />
									</Badge>
								</ListItemIcon>
								<ListItemText
									primary="投稿へのメッセージ"
									secondary={
										messageCount > 0 ? `${messageCount} 件未読` : undefined
									}
									secondaryTypographyProps={{ color: "error.main" }}
								/>
							</ListItemButton>

							<ListItemButton
								component={RouterLink}
								to="/notifications"
								onClick={handleClose}
							>
								<ListItemIcon sx={{ color: "rgba(255,255,255,0.7)" }}>
									<Notifications />
								</ListItemIcon>
								<ListItemText primary="通知" />
							</ListItemButton>

							<ListItemButton
								component={RouterLink}
								to="/settings"
								onClick={handleClose}
							>
								<ListItemIcon sx={{ color: "rgba(255,255,255,0.7)" }}>
									<Settings />
								</ListItemIcon>
								<ListItemText primary="設定" />
							</ListItemButton>

							<Divider
								sx={{ my: 1, backgroundColor: "rgba(255,255,255,0.1)" }}
							/>

							<ListItemButton
								onClick={handleLogout}
								className={styles.logoutButton}
							>
								<ListItemIcon sx={{ color: "#f44336" }}>
									<Logout />
								</ListItemIcon>
								<ListItemText
									primary="ログアウト"
									primaryTypographyProps={{
										sx: { color: "#f44336", fontWeight: 600 },
									}}
								/>
							</ListItemButton>
						</>
					) : (
						<ListItemButton
							component={RouterLink}
							to="/login"
							onClick={handleClose}
						>
							<ListItemIcon sx={{ color: "rgba(255,255,255,0.7)" }}>
								<Login />
							</ListItemIcon>
							<ListItemText primary="ログイン" />
						</ListItemButton>
					)}
				</List>
			</Drawer>
		</>
	);
};

export default UserMenu;
