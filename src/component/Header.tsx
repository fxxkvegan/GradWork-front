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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { deepOrange } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const menuItems = [
    'HOME',
    'Web 開発',
    'ios 開発',
    'Android 開発',
    'プログラミング 学習ツール',
    'サポート',

];

export const Header: React.FC = () => {
    const [searchOpen, setSearchOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            {/* けんさくのときのすりガラスオーバーレイ */}
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

            <AppBar
                position="fixed"
                color="transparent"
                elevation={0}
                sx={{
                    borderBottom: '1px solid #e0e0e0',
                    backdropFilter: 'blur(10px)',
                    zIndex: (theme) => theme.zIndex.drawer + 2,
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
                    {/* 中央メニュー */}
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
                                    key={item}
                                    variant="body2"
                                    sx={{
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        color: 'black',
                                        '&:hover': { color: 'primary.main' },
                                    }}
                                >
                                    {item}
                                </Typography>
                            ))}
                        </Box>
                    )}

                    {/* 右上: 検索・Avatar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!searchOpen && (
                            <>
                                <IconButton onClick={() => setSearchOpen(true)}>
                                    <SearchIcon />
                                </IconButton>
                                <Stack direction="row" spacing={1}>
                                    <Avatar
                                        sx={{ bgcolor: deepOrange[600], cursor: 'pointer' }}
                                        alt="Namy Sharp"
                                        src="/broken-image.jpg"
                                        onClick={() => navigate('/Register')}
                                    />
                                </Stack>
                            </>
                        )}
                    </Box>
                </Toolbar>

                {/* 検索バー */}
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
            </AppBar>
        </>
    );
};
