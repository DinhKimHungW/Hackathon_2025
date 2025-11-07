import React from 'react';
import { Box, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  sidebar,
  header,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {sidebar && (
        <Box
          component="nav"
          sx={{
            width: { sm: 240 },
            flexShrink: { sm: 0 },
            display: { xs: mobileOpen ? 'block' : 'none', sm: 'block' },
            position: { xs: 'fixed', sm: 'relative' },
            zIndex: { xs: theme.zIndex.drawer, sm: 'auto' },
          }}
        >
          {sidebar}
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: sidebar ? `calc(100% - 240px)` : '100%' },
        }}
      >
        {/* Header with mobile menu button */}
        {header && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            {isMobile && sidebar && (
              <Tooltip title="Toggle menu">
                <IconButton
                  onClick={handleDrawerToggle}
                  edge="start"
                  aria-label="open drawer"
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            )}
            {header}
          </Box>
        )}

        {/* Page Content */}
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: theme.zIndex.drawer - 1,
          }}
          onClick={handleDrawerToggle}
        />
      )}
    </Box>
  );
};

export default ResponsiveContainer;
