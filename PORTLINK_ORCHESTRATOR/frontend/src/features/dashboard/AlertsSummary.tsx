import { Card, CardContent, Typography, Box, useTheme, alpha, Chip, IconButton, Badge } from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  ChevronRight,
  Notifications,
} from '@mui/icons-material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Alert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function AlertsSummary() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Mock data - replace with real data from API
  const alerts: Alert[] = useMemo(() => [
    {
      id: '1',
      type: 'critical',
      title: 'Berth Conflict Detected',
      message: 'Double booking at Berth 3 - immediate action required',
      timestamp: '5 min ago',
      read: false,
    },
    {
      id: '2',
      type: 'high',
      title: 'Weather Advisory',
      message: 'Strong winds expected in 2 hours - wind speed up to 45 km/h',
      timestamp: '15 min ago',
      read: false,
    },
    {
      id: '3',
      type: 'medium',
      title: 'Equipment Maintenance Due',
      message: 'Crane #4 scheduled maintenance overdue by 2 days',
      timestamp: '1 hour ago',
      read: true,
    },
    {
      id: '4',
      type: 'low',
      title: 'Ship Arrival Delayed',
      message: 'MV Pacific Glory ETA pushed back by 30 minutes',
      timestamp: '2 hours ago',
      read: true,
    },
    {
      id: '5',
      type: 'info',
      title: 'System Update Available',
      message: 'New version 2.1.0 is ready for installation',
      timestamp: '3 hours ago',
      read: true,
    },
  ], []);

  const stats = useMemo(() => {
    const total = alerts.length;
    const unread = alerts.filter(a => !a.read).length;
    const critical = alerts.filter(a => a.type === 'critical').length;
    const high = alerts.filter(a => a.type === 'high').length;

    return { total, unread, critical, high };
  }, [alerts]);

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.warning.main;
      case 'medium':
        return theme.palette.info.main;
      case 'low':
        return theme.palette.success.main;
      case 'info':
        return theme.palette.grey[600];
      default:
        return theme.palette.grey[500];
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <Error fontSize="small" />;
      case 'high':
        return <Warning fontSize="small" />;
      case 'medium':
        return <Info fontSize="small" />;
      case 'low':
        return <Info fontSize="small" />;
      case 'info':
        return <CheckCircle fontSize="small" />;
      default:
        return <Info fontSize="small" />;
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={stats.unread} color="error">
              <Notifications color="action" />
            </Badge>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Alerts & Notifications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.unread} unread alerts
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => navigate('/conflicts')}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Stats Summary */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1.5,
            mb: 3,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={700} color="error.main">
              {stats.critical}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Critical
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={700} color="warning.main">
              {stats.high}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              High
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={700} color="info.main">
              {stats.total - stats.critical - stats.high}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Others
            </Typography>
          </Box>
        </Box>

        {/* Alerts List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 400, overflowY: 'auto' }}>
          {alerts.map((alert) => (
            <Box
              key={alert.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alert.read ? theme.palette.background.paper : alpha(getAlertColor(alert.type), 0.05),
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: alert.read ? 0.7 : 1,
                '&:hover': {
                  boxShadow: theme.shadows[2],
                  borderColor: getAlertColor(alert.type),
                  opacity: 1,
                },
              }}
              onClick={() => navigate('/conflicts')}
            >
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {/* Alert Icon */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(getAlertColor(alert.type), 0.15),
                    color: getAlertColor(alert.type),
                    flexShrink: 0,
                  }}
                >
                  {getAlertIcon(alert.type)}
                </Box>

                {/* Alert Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ pr: 1 }}>
                      {alert.title}
                    </Typography>
                    <Chip
                      label={alert.type}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: alpha(getAlertColor(alert.type), 0.15),
                        color: getAlertColor(alert.type),
                        textTransform: 'uppercase',
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 0.5,
                    }}
                  >
                    {alert.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {alert.timestamp}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* View All Button */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            color="primary"
            sx={{
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={() => navigate('/conflicts')}
          >
            View All Alerts →
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
