import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';

const DRAWER_WIDTH = 260;
const HEADER_HEIGHT = 64;

interface MainLayoutProps {
  children?: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(isMobile ? false : true);
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Skip to main content link for keyboard users */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          top: -40,
          left: 0,
          zIndex: 9999,
          backgroundColor: 'primary.main',
          color: 'white',
          padding: 1.5,
          textDecoration: 'none',
          fontWeight: 600,
          '&:focus': {
            top: 0,
          },
        }}
      >
        Skip to main content
      </Box>

      {/* App Header */}
      <AppHeader
        onSidebarToggle={handleSidebarToggle}
        drawerWidth={DRAWER_WIDTH}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        drawerWidth={DRAWER_WIDTH}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box
        component="main"
        id="main-content"
        role="main"
        aria-label="Main content"
        sx={{
          flexGrow: 1,
          px: { xs: 2, md: 3, xl: 5 },
          py: 3,
          mt: `${HEADER_HEIGHT}px`,
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#121212',
          ml: sidebarOpen && !isMobile ? `${DRAWER_WIDTH}px` : { md: 0 },
          transition: theme.transitions.create(['margin'], {
            easing: sidebarOpen ? theme.transitions.easing.easeOut : theme.transitions.easing.sharp,
            duration: sidebarOpen
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Page Content */}
        <Box sx={{ mt: 2 }}>
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
}
