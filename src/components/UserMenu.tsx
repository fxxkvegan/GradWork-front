import {
	Article,
	Login,
	Logout,
	Notifications,
	PersonOutline,
	Settings,
} from "@mui/icons-material";
import {
	Avatar,
	Badge,
	Box,
	Divider,
	Drawer,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import styles from "./UserMenu.module.css";

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "U";

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
	const userInitial = getInitial(userName);

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
						color="error"
						variant="dot"
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
							<Avatar
								sx={{
									width: 30,
									height: 30,
									bgcolor: "#424242",
									fontSize: 14,
								}}
							>
								{userInitial}
							</Avatar>
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
							<Avatar
								sx={{
									width: 60,
									height: 60,
									bgcolor: "#424242",
									fontSize: 24,
								}}
							>
								{userInitial}
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
							<ListSubheader
								sx={{ bgcolor: "inherit", color: "rgba(255,255,255,0.5)" }}
							>
								マイメニュー
							</ListSubheader>

							<ListItemButton
								component={RouterLink}
								to="/my-products"
								onClick={handleClose}
							>
								<ListItemIcon sx={{ color: "rgba(255,255,255,0.7)" }}>
									<Article />
								</ListItemIcon>
								<ListItemText primary="あなたの投稿一覧" />
							</ListItemButton>

							<ListItemButton
								component={RouterLink}
								to="/create"
								onClick={handleClose}
							>
								<ListItemIcon sx={{ color: "rgba(255,255,255,0.7)" }}>
									<Article />
								</ListItemIcon>
								<ListItemText primary="商品を投稿" />
							</ListItemButton>

							<ListItemButton
								component={RouterLink}
								to="/notifications"
								onClick={handleClose}
							>
								<ListItemIcon sx={{ color: "rgba(255,255,255,0.7)" }}>
									<Badge
										badgeContent={messageCount}
										color="error"
										invisible={messageCount === 0}
									>
										<Notifications />
									</Badge>
								</ListItemIcon>
								<ListItemText
									primary="通知"
									secondary={
										messageCount > 0 ? `${messageCount} 件未読` : undefined
									}
									secondaryTypographyProps={{ color: "error.main" }}
								/>
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
