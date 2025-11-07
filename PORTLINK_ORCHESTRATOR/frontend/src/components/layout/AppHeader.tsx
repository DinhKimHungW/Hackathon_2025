import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  InputBase,
  Badge,
  Avatar,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Brightness4,
  Brightness7,
  DirectionsBoat,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/features/auth/authSlice';
import UserMenu from './UserMenu';
import NotificationsMenu from './NotificationsMenu';
import { useThemeMode } from '@/theme/ThemeModeProvider';

interface AppHeaderProps {
  onSidebarToggle: () => void;
  drawerWidth: number;
  sidebarOpen: boolean;
  isMobile: boolean;
}

export default function AppHeader({ onSidebarToggle, drawerWidth, sidebarOpen, isMobile }: AppHeaderProps) {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const user = useAppSelector(selectUser);
  
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Search for:', searchQuery);
      // TODO: Implement global search
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      component="header"
      role="banner"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        width: {
          xs: '100%',
          md: sidebarOpen && !isMobile ? `calc(100% - ${drawerWidth}px)` : '100%',
        },
        ml: {
          md: sidebarOpen && !isMobile ? `${drawerWidth}px` : 0,
        },
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(135deg, #0A2463 0%, #1E88E5 100%)'
          : theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar>
        {/* Sidebar Toggle Button */}
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          edge="start"
          onClick={onSidebarToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 4 }}>
          <DirectionsBoat sx={{ fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}
            >
              PortLink
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: { xs: 'none', sm: 'block' },
                opacity: 0.8,
                fontSize: '0.65rem',
                lineHeight: 1,
                mt: -0.5,
              }}
            >
              Orchestrator
            </Typography>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          role="search"
          aria-label="Search"
          sx={{
            position: 'relative',
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.25),
            },
            mr: 2,
            ml: { xs: 0, sm: 3 },
            width: { xs: '100%', sm: 'auto' },
            flexGrow: { xs: 0, md: 1 },
            maxWidth: { md: 600 },
          }}
        >
          <Box
            sx={{
              padding: theme.spacing(0, 2),
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon />
          </Box>
          <InputBase
            placeholder="Search ships, tasks, assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            inputProps={{
              'aria-label': 'Search ships, tasks, assets',
              'role': 'searchbox',
            }}
            sx={{
              color: 'inherit',
              width: '100%',
              '& .MuiInputBase-input': {
                padding: theme.spacing(1, 1, 1, 0),
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                transition: theme.transitions.create('width'),
                width: { xs: '100%', md: '300px' },
                '&:focus': {
                  width: { md: '400px' },
                },
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right Side Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            <IconButton 
              color="inherit" 
              onClick={toggleTheme}
              aria-label={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleOpenNotifications}
              aria-label="Open notifications"
              aria-haspopup="true"
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Avatar */}
          <Tooltip title="Account settings">
            <IconButton 
              onClick={handleOpenUserMenu} 
              sx={{ p: 0.5 }}
              aria-label="Open user menu"
              aria-haspopup="true"
            >
              <Avatar
                alt={user?.username || 'User'}
                src={user?.avatarUrl}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'secondary.main',
                  border: '2px solid',
                  borderColor: alpha(theme.palette.common.white, 0.3),
                }}
              >
                {user?.fullName?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* User Menu */}
        <UserMenu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        />

        {/* Notifications Menu */}
        <NotificationsMenu
          anchorEl={anchorElNotifications}
          open={Boolean(anchorElNotifications)}
          onClose={handleCloseNotifications}
        />
      </Toolbar>
    </AppBar>
  );
}
