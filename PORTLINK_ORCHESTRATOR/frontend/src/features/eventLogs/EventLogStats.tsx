import React, { useEffect } from 'react';
import { Box, Paper, Typography, Chip, Alert } from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEventLogStats } from './eventLogsSlice';

export const EventLogStats: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.eventLogs);

  useEffect(() => {
    dispatch(fetchEventLogStats());
  }, [dispatch]);

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderLeft: 4,
        borderColor: color,
      }}
    >
      <Box sx={{ color }}>{icon}</Box>
      <Box>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Loading stats...</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Recent Errors Alert */}
      {stats.recentErrors > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>{stats.recentErrors} recent errors detected!</strong> Review event logs for details.
        </Alert>
      )}

      {/* Summary Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="Total Events"
          value={stats.total}
          icon={<TrendingUpIcon />}
          color="#2196f3"
        />
        <StatCard title="Info" value={stats.bySeverity.INFO} icon={<InfoIcon />} color="#0288d1" />
        <StatCard
          title="Warnings"
          value={stats.bySeverity.WARNING}
          icon={<WarningIcon />}
          color="#ff9800"
        />
        <StatCard
          title="Errors"
          value={stats.bySeverity.ERROR + stats.bySeverity.CRITICAL}
          icon={<ErrorIcon />}
          color="#f44336"
        />
      </Box>

      {/* By Severity */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          By Severity
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<InfoIcon />}
            label={`Info: ${stats.bySeverity.INFO}`}
            color="info"
            variant="outlined"
          />
          <Chip
            icon={<WarningIcon />}
            label={`Warning: ${stats.bySeverity.WARNING}`}
            color="warning"
            variant="outlined"
          />
          <Chip
            icon={<ErrorIcon />}
            label={`Error: ${stats.bySeverity.ERROR}`}
            color="error"
            variant="outlined"
          />
          <Chip
            icon={<ErrorIcon />}
            label={`Critical: ${stats.bySeverity.CRITICAL}`}
            color="error"
          />
        </Box>
      </Paper>

      {/* By Event Type */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          By Event Type
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(stats.byEventType).map(([type, count]) => (
            <Chip
              key={type}
              label={`${type.replace(/_/g, ' ')}: ${count}`}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default EventLogStats;
