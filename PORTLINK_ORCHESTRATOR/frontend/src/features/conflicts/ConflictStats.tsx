import React, { useEffect } from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConflictStats } from './conflictsSlice';

interface ConflictStatsProps {
  simulationRunId?: string;
}

export const ConflictStats: React.FC<ConflictStatsProps> = ({ simulationRunId }) => {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.conflicts);

  useEffect(() => {
    dispatch(fetchConflictStats(simulationRunId));
  }, [dispatch, simulationRunId]);

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
      {/* Summary Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard title="Total Conflicts" value={stats.total} icon={<WarningIcon />} color="#9e9e9e" />
        <StatCard
          title="Unresolved"
          value={stats.unresolved}
          icon={<ErrorIcon />}
          color="#ff9800"
        />
        <StatCard
          title="Critical"
          value={stats.critical}
          icon={<ErrorIcon />}
          color="#f44336"
        />
        <StatCard
          title="Resolved"
          value={stats.total - stats.unresolved}
          icon={<CheckCircleIcon />}
          color="#4caf50"
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
            label={`Low: ${stats.bySeverity.LOW}`}
            color="info"
            variant="outlined"
          />
          <Chip
            icon={<WarningIcon />}
            label={`Medium: ${stats.bySeverity.MEDIUM}`}
            color="warning"
            variant="outlined"
          />
          <Chip
            icon={<ErrorIcon />}
            label={`High: ${stats.bySeverity.HIGH}`}
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

      {/* By Type */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          By Type
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`🔧 Resource: ${stats.byType.RESOURCE_OVERLAP}`} variant="outlined" />
          <Chip label={`⏰ Time: ${stats.byType.TIME_OVERLAP}`} variant="outlined" />
          <Chip label={`📍 Location: ${stats.byType.LOCATION_OVERLAP}`} variant="outlined" />
          <Chip label={`📊 Capacity: ${stats.byType.CAPACITY_EXCEEDED}`} variant="outlined" />
        </Box>
      </Paper>
    </Box>
  );
};

export default ConflictStats;
