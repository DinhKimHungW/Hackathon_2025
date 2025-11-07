import { Card, CardContent, Typography, Box, useTheme, alpha, LinearProgress, Chip } from '@mui/material';
import { Anchor, Warning, CheckCircle, Schedule } from '@mui/icons-material';
import { useMemo } from 'react';

interface BerthData {
  id: string;
  name: string;
  occupancy: number;
  status: 'occupied' | 'available' | 'maintenance' | 'reserved';
  currentShip?: string;
  estimatedFree?: string;
}

export default function BerthOccupancyChart() {
  const theme = useTheme();

  // Mock data - replace with real data from API
  const berthsData: BerthData[] = useMemo(() => [
    {
      id: 'B1',
      name: 'Berth 1',
      occupancy: 100,
      status: 'occupied',
      currentShip: 'MV Ocean Star',
      estimatedFree: '2h 30m',
    },
    {
      id: 'B2',
      name: 'Berth 2',
      occupancy: 0,
      status: 'available',
    },
    {
      id: 'B3',
      name: 'Berth 3',
      occupancy: 75,
      status: 'occupied',
      currentShip: 'MV Pacific Glory',
      estimatedFree: '5h 15m',
    },
    {
      id: 'B4',
      name: 'Berth 4',
      occupancy: 0,
      status: 'maintenance',
    },
    {
      id: 'B5',
      name: 'Berth 5',
      occupancy: 100,
      status: 'occupied',
      currentShip: 'MV Atlantic Wave',
      estimatedFree: '1h 45m',
    },
    {
      id: 'B6',
      name: 'Berth 6',
      occupancy: 0,
      status: 'reserved',
      estimatedFree: '30m',
    },
  ], []);

  const stats = useMemo(() => {
    const total = berthsData.length;
    const occupied = berthsData.filter(b => b.status === 'occupied').length;
    const available = berthsData.filter(b => b.status === 'available').length;
    const maintenance = berthsData.filter(b => b.status === 'maintenance').length;
    const avgOccupancy = Math.round(
      berthsData.reduce((sum, b) => sum + b.occupancy, 0) / total
    );

    return { total, occupied, available, maintenance, avgOccupancy };
  }, [berthsData]);

  const getStatusColor = (status: BerthData['status']) => {
    switch (status) {
      case 'occupied':
        return theme.palette.error.main;
      case 'available':
        return theme.palette.success.main;
      case 'maintenance':
        return theme.palette.warning.main;
      case 'reserved':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: BerthData['status']) => {
    switch (status) {
      case 'occupied':
        return <Anchor fontSize="small" />;
      case 'available':
        return <CheckCircle fontSize="small" />;
      case 'maintenance':
        return <Warning fontSize="small" />;
      case 'reserved':
        return <Schedule fontSize="small" />;
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Berth Occupancy
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time berth utilization status
            </Typography>
          </Box>
          <Chip
            label={`${stats.avgOccupancy}%`}
            sx={{
              bgcolor: alpha(
                stats.avgOccupancy > 75 ? theme.palette.error.main : theme.palette.success.main,
                0.1
              ),
              color: stats.avgOccupancy > 75 ? theme.palette.error.main : theme.palette.success.main,
              fontWeight: 700,
            }}
          />
        </Box>

        {/* Stats Summary */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} color="primary">
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} color="error.main">
              {stats.occupied}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Occupied
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {stats.available}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Available
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} color="warning.main">
              {stats.maintenance}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Maintenance
            </Typography>
          </Box>
        </Box>

        {/* Berths List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {berthsData.map((berth) => (
            <Box
              key={berth.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: theme.shadows[2],
                  borderColor: getStatusColor(berth.status),
                },
              }}
            >
              {/* Berth Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(berth.status),
                      animation: berth.status === 'occupied' ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }}
                  />
                  <Typography variant="subtitle2" fontWeight={600}>
                    {berth.name}
                  </Typography>
                </Box>
                <Chip
                  icon={getStatusIcon(berth.status)}
                  label={berth.status.charAt(0).toUpperCase() + berth.status.slice(1)}
                  size="small"
                  sx={{
                    bgcolor: alpha(getStatusColor(berth.status), 0.1),
                    color: getStatusColor(berth.status),
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>

              {/* Ship Info (if occupied) */}
              {berth.currentShip && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  <strong>Current:</strong> {berth.currentShip}
                </Typography>
              )}

              {/* Progress Bar */}
              <Box sx={{ mb: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={berth.occupancy}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getStatusColor(berth.status),
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>

              {/* Footer Info */}
              {berth.estimatedFree && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Occupancy: {berth.occupancy}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {berth.status === 'occupied' ? 'Free in: ' : 'Reserved for: '}{berth.estimatedFree}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
