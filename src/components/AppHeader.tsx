import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link as RouterLink } from 'react-router-dom';
import useScrollDirection from '../hooks/useScrollDirection';
import styles from './AppHeader.module.css';
import UserMenu from './UserMenu';

// SVGアイコンをpngイメージに置き換え
const NiceDigIcon = () => (
    <img src="/nice_dig.png" alt="Nice dig logo" width="24" height="24" />
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

// ナビゲーションリンク
const navItems = [
    { label: 'HOME', path: '/home' },
    { label: 'Web 開発', path: '/web' },
    { label: 'iOS 開発', path: '/ios' },
    { label: 'Android 開発', path: '/android' },
    { label: 'プログラミング 学習', path: '/tools' },
    { label: 'サポート', path: '/support' },
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
    activePath = '',
    isLoggedIn = false,
    messageCount = 0,
    onLogout,
    userName,
    avatarUrl
}) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchClosing, setIsSearchClosing] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const scrollDirection = useScrollDirection();
    const [isScrolled, setIsScrolled] = useState(false);

    // スクロール検出
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // 検索フォームを開いたときに入力フィールドにフォーカス
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

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
        console.log('Search submitted:', searchInputRef.current?.value);
        handleCloseSearch();
    };

    return (
        <header className={`${styles.header} ${(scrollDirection === 'down' && isScrolled) ? styles.headerHidden : ''}`} role="banner">
            <div className={styles.container}>                {/* 左側セクション - ロゴとタイトル */}                <div className={styles.leftSection}>
                <RouterLink to="/" className={styles.logo} aria-label="Nice dig">
                    <NiceDigIcon />
                </RouterLink>
                <RouterLink to="/" className={styles.title}>Nice dig</RouterLink>
            </div>

                {/* 中央ナビゲーション - デスクトップのみ */}
                <nav className={styles.nav} aria-label="Global Navigation">
                    <ul className={styles.navList}>
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <RouterLink
                                    to={item.path}
                                    className={`${styles.navItem} ${activePath === item.path ? styles.activeNavItem : ''}`}
                                >
                                    {item.label}
                                </RouterLink>
                            </li>
                        ))}
                    </ul>
                </nav>{/* 右側セクション - 検索とメニューとユーザーアバター */}
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
            {isSearchOpen && createPortal(
                <div className={`${styles.searchOverlay} ${isSearchClosing ? styles.searchOverlayHidden : ''}`}>
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
                        />
                        <button
                            type="submit"
                            className={styles.iconButton}
                            aria-label="検索を実行"
                        >
                            <SearchIcon />
                        </button>
                    </form>
                </div>,
                document.body
            )}

            {/* モバイルメニュードロワー */}
            {createPortal(
                <div
                    className={`${styles.drawer} ${isMenuOpen ? styles.drawerOpen : ''}`}
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
                        </button>                        <ul className={styles.drawerNavList}>
                            {navItems.map((item) => (
                                <li key={item.path} className={styles.drawerNavItem}>
                                    <RouterLink to={item.path} onClick={() => setIsMenuOpen(false)}>{item.label}</RouterLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>,
                document.body
            )}
        </header>
    );
};

export default AppHeader;
