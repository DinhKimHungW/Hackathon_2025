import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, alpha, useTheme } from '@mui/material';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { selectUser } from '../auth/authSlice';
import {
  fetchKPISummary,
  fetchShipArrivals,
  fetchTaskStatus,
  fetchAssetUtilization,
  fetchScheduleTimeline,
  selectShipArrivals,
  selectTaskStatus,
  selectAssetUtilization,
  selectScheduleTimeline,
  selectKPILoading,
} from './kpiSlice';
import KPIGrid from './KPIGrid';
import QuickActions from './QuickActions';
import BerthOccupancyChart from './BerthOccupancyChart';
import AlertsSummary from './AlertsSummary';
import WeatherWidget from './WeatherWidget';
import RecentActivityFeed from './RecentActivityFeed';
import ShipArrivalsChart from '@components/charts/ShipArrivalsChart';
import TaskStatusChart from '@components/charts/TaskStatusChart';
import AssetUtilizationChart from '@components/charts/AssetUtilizationChart';
import ScheduleTimelineChart from '@components/charts/ScheduleTimelineChart';
import { TrendingUp, Assessment } from '@mui/icons-material';

export default function Dashboard() {
  const user = useAppSelector(selectUser);
  const shipArrivals = useAppSelector(selectShipArrivals);
  const taskStatus = useAppSelector(selectTaskStatus);
  const assetUtilization = useAppSelector(selectAssetUtilization);
  const scheduleTimeline = useAppSelector(selectScheduleTimeline);
  const loading = useAppSelector(selectKPILoading);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Fetch KPI data when dashboard loads
      dispatch(fetchKPISummary());
      dispatch(fetchShipArrivals(7));
      dispatch(fetchTaskStatus());
      dispatch(fetchAssetUtilization());
      dispatch(fetchScheduleTimeline(7));
    }
  }, [user, navigate, dispatch]);

  if (!user) {
    return null;
  }

  const currentTime = new Date().toLocaleString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: theme.palette.mode === 'light'
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
          : theme.palette.background.default,
        py: 3,
        px: { xs: 2, md: 4, xl: 6 },
      }}
    >
      {/* Enhanced Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: theme.palette.mode === 'light'
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: `radial-gradient(circle at top right, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Assessment sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={700}>
              Dashboard Overview
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
            Monitor port operations and key metrics in real-time
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {currentTime}
          </Typography>
        </Box>
      </Paper>

      {/* KPI Cards */}
      <KPIGrid />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3, mb: 4 }}>
        {/* Left Column - Charts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Ship Arrivals */}
          <ShipArrivalsChart data={shipArrivals} loading={loading} />

          {/* Task Status & Asset Utilization */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TaskStatusChart data={taskStatus} loading={loading} />
            <AssetUtilizationChart data={assetUtilization} loading={loading} />
          </Box>

          {/* Schedule Timeline */}
          <ScheduleTimelineChart data={scheduleTimeline} loading={loading} />

          {/* Berth Occupancy */}
          <BerthOccupancyChart />
        </Box>

        {/* Right Column - Widgets */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Weather Widget */}
          <WeatherWidget />

          {/* Alerts Summary */}
          <AlertsSummary />

          {/* Recent Activity Feed */}
          <RecentActivityFeed />
        </Box>
      </Box>

      {/* Performance Insights Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.mode === 'light'
            ? alpha(theme.palette.success.main, 0.05)
            : alpha(theme.palette.success.dark, 0.1),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
              color: 'white',
            }}
          >
            <TrendingUp />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Performance Insights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered recommendations for optimal operations
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              EFFICIENCY SCORE
            </Typography>
            <Typography variant="h4" fontWeight={700} color="success.main" sx={{ my: 1 }}>
              92%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              +5% from last week
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              AVG TURNAROUND
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ my: 1 }}>
              18.5h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              -2.3h improvement
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              COST SAVINGS
            </Typography>
            <Typography variant="h4" fontWeight={700} color="warning.main" sx={{ my: 1 }}>
              $42K
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This month
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
