import React from 'react';
import { Box, Grid } from '@mui/material';
import { useResponsive } from '../hooks/useResponsive';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  ViewList as ViewListIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { ViewMode } from '../types';

interface ResponsiveScheduleLayoutProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  children: React.ReactNode;
}

export const ResponsiveScheduleLayout: React.FC<ResponsiveScheduleLayoutProps> = ({
  viewMode,
  onViewModeChange,
  children
}) => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      <Grid container spacing={2}>
        {/* View Mode Switcher */}
        <Grid item xs={12}>
          <Box sx={{ 
            mb: { xs: 2, sm: 3 },
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              size={isMobile ? "small" : "medium"}
              onChange={(_, newValue) => {
                if (newValue !== null) {
                  onViewModeChange(newValue as ViewMode);
                }
              }}
              aria-label="view mode"
            >
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon sx={{ mr: isMobile ? 0.5 : 1 }} />
                {!isMobile && "List View"}
              </ToggleButton>
              <ToggleButton value="timeline" aria-label="timeline view">
                <TimelineIcon sx={{ mr: isMobile ? 0.5 : 1 }} />
                {!isMobile && "Timeline View"}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12}>
          <Box sx={{ 
            mt: { xs: 1, sm: 2 },
            height: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 200px)'
          }}>
            {children}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};