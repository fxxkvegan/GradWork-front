import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    InputBase,
    Fade,
    Avatar,
    Stack,
    Slide,
    useScrollTrigger,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { deepOrange } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import './Header.css';

// スクロール時にヘッダーを隠すためのコンポーネント
interface HideOnScrollProps {
    children: React.ReactElement;
    window?: () => Window;
}

function HideOnScroll(props: HideOnScrollProps) {
    const { children, window } = props;
    // スクロールダウン時にトリガーを発動
    const trigger = useScrollTrigger({
        target: window ? window() : undefined,
        threshold: 100, // 100px以上スクロールしたときに隠す
        disableHysteresis: false, // ヒステリシスを有効にして、スクロール方向の変化に対してより滑らかに反応
    });

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

export const Header: React.FC = () => {
    const [searchOpen, setSearchOpen] = useState(false);
    const navigate = useNavigate();

    // スクロール状態を検出
    const isScrolled = useScrollTrigger({
        disableHysteresis: false,
        threshold: 50,
    });

    const menuItems = [
        { label: 'HOME', path: '/home' },
        { label: 'Web 開発', path: '/web' },
        { label: 'ios 開発', path: '/ios' },
        { label: 'Android 開発', path: '/android' },
        { label: 'プログラミング 学習', path: '/tools' },
        { label: 'サポート', path: '/support' },
    ];

    return (
        <>
            {/* 検索時の背景オーバーレイ */}
            <Box
                className="glass"
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    transition: 'opacity 1s ease-in-out',
                    opacity: searchOpen ? 1 : 0,
                    pointerEvents: searchOpen ? 'auto' : 'none',
                }}
            />

            {/* スクロール時に隠れるヘッダー */}
            <HideOnScroll>
                <AppBar
                    position="fixed"
                    color="transparent"
                    elevation={isScrolled ? 4 : 0}
                    className={isScrolled ? "scrolled" : ""}
                    sx={{
                        borderBottom: '1px solid #e0e0e0',
                        backdropFilter: 'blur(10px)',
                        zIndex: (theme) => theme.zIndex.drawer + 2,
                        transition: 'all 0.3s ease',
                        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
                    }}
                >
                    <Toolbar
                        variant="dense"
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            px: { xs: 1, sm: 3 },
                        }}
                    >
                        {!searchOpen && (
                            <Box
                                sx={{
                                    display: { xs: 'none', sm: 'flex' },
                                    flexGrow: 1,
                                    justifyContent: 'center',
                                    gap: 3,
                                }}
                            >
                                {menuItems.map((item) => (
                                    <Typography
                                        key={item.label}
                                        variant="body2"
                                        sx={{
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            color: isScrolled ? '#000' : '#333',
                                            transition: 'color 0.3s ease',
                                            '&:hover': { color: 'primary.main' },
                                        }}
                                        onClick={() => navigate(item.path)}
                                    >
                                        {item.label}
                                    </Typography>
                                ))}
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {!searchOpen && (
                                <>
                                    <IconButton onClick={() => setSearchOpen(true)}>
                                        <SearchIcon />
                                    </IconButton>
                                    <Stack direction="row" spacing={1}>
                                        <Avatar
                                            sx={{ bgcolor: deepOrange[600], cursor: 'pointer' }}
                                            alt="User Avatar"
                                            src="/broken-image.jpg"
                                            onClick={() => navigate('/Register')}
                                        />
                                    </Stack>
                                </>
                            )}
                        </Box>
                    </Toolbar>
                </AppBar>
            </HideOnScroll>

            {/* 検索オーバーレイ - 固定位置 */}
            <Fade in={searchOpen}>
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        zIndex: (theme) => theme.zIndex.drawer + 3,
                        borderBottom: '1px solid #e0e0e0',
                    }}
                >
                    <IconButton onClick={() => setSearchOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                    <InputBase
                        placeholder="検索"
                        fullWidth
                        sx={{ ml: 1, fontSize: '1.2rem' }}
                    />
                </Box>
            </Fade>
        </>
    );
};
