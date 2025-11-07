import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DirectionsBoat as ShipIcon,
  CalendarToday as CalendarIcon,
  Assignment as TaskIcon,
  Category as AssetIcon,
  Warning as ConflictIcon,
  Science as SimulationIcon,
  Map as MapIcon,
  Description as LogIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  SmartToy as ChatbotIcon,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
  isMobile: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  color?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    id: 'ship-visits',
    label: 'Ship Visits',
    path: '/ship-visits',
    icon: <ShipIcon />,
    badge: 8,
    color: 'primary',
  },
  {
    id: 'schedules',
    label: 'Schedules',
    path: '/schedules',
    icon: <CalendarIcon />,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: <TaskIcon />,
    badge: 12,
    color: 'info',
  },
  {
    id: 'assets',
    label: 'Assets',
    path: '/assets',
    icon: <AssetIcon />,
  },
  {
    id: 'conflicts',
    label: 'Conflicts',
    path: '/conflicts',
    icon: <ConflictIcon />,
    badge: 3,
    color: 'error',
  },
  {
    id: 'simulation',
    label: 'Simulation',
    path: '/simulation',
    icon: <SimulationIcon />,
  },
  {
    id: 'port-map',
    label: 'Port Map',
    path: '/port-map',
    icon: <MapIcon />,
    color: 'success',
  },
  {
    id: 'event-logs',
    label: 'Event Logs',
    path: '/event-logs',
    icon: <LogIcon />,
  },
  {
    id: 'chatbot',
    label: 'AI Assistant',
    path: '/chatbot',
    icon: <ChatbotIcon />,
    color: 'secondary',
  },
];

const bottomMenuItems: MenuItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: <PersonIcon />,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: <SettingsIcon />,
  },
];

export default function Sidebar({ open, onClose, drawerWidth, isMobile }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box 
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      component="nav"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Spacer for AppHeader */}
      <Box sx={{ height: 64 }} />

      {/* Main Menu Section */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Main Menu
        </Typography>
      </Box>

      <List sx={{ px: 1, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={active}
                aria-current={active ? 'page' : undefined}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'light'
                      ? 'rgba(30, 136, 229, 0.1)'
                      : 'rgba(30, 136, 229, 0.15)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'light'
                        ? 'rgba(30, 136, 229, 0.15)'
                        : 'rgba(30, 136, 229, 0.2)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                      color: 'primary.main',
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'light'
                      ? 'rgba(0, 0, 0, 0.04)'
                      : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                  }}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color={item.color as any || 'default'}
                    sx={{
                      height: 20,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Bottom Menu Section */}
      <List sx={{ px: 1, pb: 2 }}>
        {bottomMenuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={active}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'light'
                      ? 'rgba(30, 136, 229, 0.1)'
                      : 'rgba(30, 136, 229, 0.15)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'light'
                        ? 'rgba(30, 136, 229, 0.15)'
                        : 'rgba(30, 136, 229, 0.2)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        display: !isMobile && !open ? 'none' : 'block',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.paper,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
