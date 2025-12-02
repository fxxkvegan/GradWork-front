import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link as RouterLink } from "react-router-dom";
import useScrollDirection from "../hooks/useScrollDirection";
import styles from "./AppHeader.module.css";
import UserMenu from "./UserMenu";

// SVGアイコンをpngイメージに置き換え
const NiceDigIcon = () => (
	<img src="/nice_dig.png" alt="Nice dig logo" width="24" height="24" />
);

const SearchIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="11" cy="11" r="8"></circle>
		<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
	</svg>
);

const CloseIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="18" y1="6" x2="6" y2="18"></line>
		<line x1="6" y1="6" x2="18" y2="18"></line>
	</svg>
);

const MenuIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="3" y1="12" x2="21" y2="12"></line>
		<line x1="3" y1="6" x2="21" y2="6"></line>
		<line x1="3" y1="18" x2="21" y2="18"></line>
	</svg>
);

// ナビゲーションリンク
const navItems = [
	{ label: "HOME", path: "/home" },
	{ label: "プロジェクト一覧", path: "/item" },
	{ label: "WEB開発", path: "/item?categoryId=1" },
	{ label: "AI開発", path: "/item?categoryId=2" },
	{
		label: "IoT開発",
		path: "/item?categoryId=10",
	},
];

interface AppHeaderProps {
	activePath?: string;
	isLoggedIn?: boolean;
	messageCount?: number;
	onLogout?: () => void;
	userName?: string;
	avatarUrl?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
	activePath = "",
	isLoggedIn = false,
	messageCount = 0,
	onLogout,
	userName,
	avatarUrl,
}) => {
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSearchClosing, setIsSearchClosing] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const scrollDirection = useScrollDirection();
	const [isScrolled, setIsScrolled] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [suggestions, setSuggestions] = useState<any[]>([]);
	const [allProducts, setAllProducts] = useState<any[]>([]);

	// スクロール検出
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// 検索フォームを開いたときに入力フィールドにフォーカス
	useEffect(() => {
		if (isSearchOpen && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isSearchOpen]);

	useEffect(() => {
		const fetchAllProducts = async () => {
			try {
				const res = await fetch("https://app.nice-dig.com/api/products");
				const data = await res.json();

				// items の中に本体が入っている
				setAllProducts(data.items || []);
			} catch (err) {
				console.error("Failed to fetch products", err);
				setAllProducts([]); // エラーでも配列にしておく
			}
		};

		fetchAllProducts();
	}, []);

	// ▼ 入力が変わった時にフィルタしてサジェスト更新
	useEffect(() => {
		if (!searchTerm) {
			setSuggestions([]);
			return;
		}

		const q = searchTerm.toLowerCase();

		// 部分一致でフィルタ
		const filtered = allProducts.filter((item: any) => {
			const name = (item.name || "").toLowerCase();
			const desc = (item.description || "").toLowerCase();

			return name.includes(q) || desc.includes(q);
		});

		// 上位5件を出す
		setSuggestions(filtered.slice(0, 5));
	}, [searchTerm, allProducts]);

	// 検索フォームを閉じるときのアニメーション処理
	const handleCloseSearch = () => {
		setIsSearchClosing(true);
		setTimeout(() => {
			setIsSearchOpen(false);
			setIsSearchClosing(false);
		}, 300);
	};

	// 検索フォームの送信処理
	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleCloseSearch();
	};

	return (
		<header
			className={`${styles.header} ${scrollDirection === "down" && isScrolled ? styles.headerHidden : ""}`}
			role="banner"
		>
			<div className={styles.container}>
				{" "}
				{/* 左側セクション - ロゴとタイトル */}{" "}
				<div className={styles.leftSection}>
					<RouterLink to="/" className={styles.logo} aria-label="Nice dig">
						<NiceDigIcon />
					</RouterLink>
					<RouterLink to="/" className={styles.title}>
						Nice dig
					</RouterLink>
				</div>
				{/* 中央ナビゲーション - デスクトップのみ */}
				<nav className={styles.nav} aria-label="Global Navigation">
					<ul className={styles.navList}>
						{navItems.map((item) => (
							<li key={item.path}>
								<RouterLink
									to={item.path}
									className={`${styles.navItem} ${activePath === item.path ? styles.activeNavItem : ""}`}
								>
									{item.label}
								</RouterLink>
							</li>
						))}
					</ul>
				</nav>
				{/* 右側セクション - 検索とメニューとユーザーアバター */}
				<div className={styles.rightSection}>
					<button
						className={styles.iconButton}
						onClick={() => setIsSearchOpen(true)}
						aria-label="検索を開く"
					>
						<SearchIcon />
					</button>

					<button
						className={`${styles.iconButton} ${styles.menuButton}`}
						onClick={() => setIsMenuOpen(true)}
						aria-label="メニューを開く"
					>
						<MenuIcon />
					</button>
					<UserMenu
						isLoggedIn={isLoggedIn}
						messageCount={messageCount}
						onLogout={onLogout}
						userName={userName}
						avatarUrl={avatarUrl}
					/>
				</div>
			</div>

			{/* 検索オーバーレイ */}
			{isSearchOpen &&
				createPortal(
					<div
						className={`${styles.searchOverlay} ${isSearchClosing ? styles.searchOverlayHidden : ""}`}
					>
						<form className={styles.searchForm} onSubmit={handleSearchSubmit}>
							<button
								type="button"
								className={styles.iconButton}
								onClick={handleCloseSearch}
								aria-label="検索を閉じる"
							>
								<CloseIcon />
							</button>
							<input
								type="text"
								className={styles.searchInput}
								placeholder="検索..."
								ref={searchInputRef}
								aria-label="検索ワード"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<button
								type="submit"
								className={styles.iconButton}
								aria-label="検索を実行"
							>
								<SearchIcon />
							</button>
						</form>
						{/* ▼ サジェスト結果 */}
						{searchTerm && suggestions.length > 0 && (
							<ul className={styles.suggestionList}>
								{suggestions.map((item, index) => {
									const img = JSON.parse(item.image_url || "[]")[0];

									return (
										<li key={index} className={styles.suggestionCard}>
											{/* 画像 */}
											<img
												src={img}
												alt=""
												className={styles.suggestionThumb}
											/>

											{/* カテゴリ */}
											{item.categoryIds?.length > 0 && (
												<div className={styles.suggestionCategory}>
													カテゴリ {item.categoryIds[0]}
												</div>
											)}

											{/* 評価・DL */}
											<div className={styles.suggestionMeta}>
												{item.download_count} DL　★ {item.rating}
											</div>

											{/* タイトル */}
											<div className={styles.suggestionTitle}>{item.name}</div>

											{/* 説明 */}
											<div className={styles.suggestionDesc}>
												{item.description}
											</div>

											{/* 詳細ボタン */}
											<div className={styles.suggestionButton}>詳細を見る</div>
										</li>
									);
								})}
							</ul>
						)}
					</div>,
					document.body,
				)}

			{/* モバイルメニュードロワー */}
			{createPortal(
				<div
					className={`${styles.drawer} ${isMenuOpen ? styles.drawerOpen : ""}`}
					onClick={(e) => {
						if (e.target === e.currentTarget) setIsMenuOpen(false);
					}}
					aria-hidden={!isMenuOpen}
				>
					<div className={styles.drawerContent}>
						<button
							className={styles.iconButton}
							onClick={() => setIsMenuOpen(false)}
							aria-label="メニューを閉じる"
						>
							<CloseIcon />
						</button>{" "}
						<ul className={styles.drawerNavList}>
							{navItems.map((item) => (
								<li key={item.path} className={styles.drawerNavItem}>
									<RouterLink
										to={item.path}
										onClick={() => setIsMenuOpen(false)}
									>
										{item.label}
									</RouterLink>
								</li>
							))}
						</ul>
					</div>
				</div>,
				document.body,
			)}
		</header>
	);
};

export default AppHeader;
