import { Card, CardContent, Typography, Box, useTheme, alpha, Avatar, Chip } from '@mui/material';
import {
  DirectionsBoat,
  LocalShipping,
  CheckCircle,
  Schedule,
  Warning,
  Build,
  Assignment,
} from '@mui/icons-material';
import { useMemo } from 'react';

interface Activity {
  id: string;
  type: 'ship_arrival' | 'ship_departure' | 'task_completed' | 'task_assigned' | 'alert' | 'maintenance' | 'schedule_update';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export default function RecentActivityFeed() {
  const theme = useTheme();

  // Mock activity data - replace with real data from API
  const activities: Activity[] = useMemo(() => [
    {
      id: '1',
      type: 'ship_arrival',
      title: 'Ship Arrived',
      description: 'MV Ocean Star docked at Berth 1',
      timestamp: '10 min ago',
      user: 'John Doe',
      status: 'success',
    },
    {
      id: '2',
      type: 'task_completed',
      title: 'Loading Complete',
      description: 'Container loading completed for MV Pacific Glory',
      timestamp: '25 min ago',
      user: 'Jane Smith',
      status: 'success',
    },
    {
      id: '3',
      type: 'alert',
      title: 'Weather Advisory',
      description: 'Strong winds expected in next 2 hours',
      timestamp: '35 min ago',
      status: 'warning',
    },
    {
      id: '4',
      type: 'task_assigned',
      title: 'New Task Assigned',
      description: 'Unloading operation for MV Atlantic Wave',
      timestamp: '1 hour ago',
      user: 'Mike Johnson',
      status: 'info',
    },
    {
      id: '5',
      type: 'maintenance',
      title: 'Maintenance Scheduled',
      description: 'Crane #3 scheduled for maintenance tomorrow',
      timestamp: '2 hours ago',
      user: 'System',
      status: 'info',
    },
    {
      id: '6',
      type: 'ship_departure',
      title: 'Ship Departed',
      description: 'MV Northern Star left Berth 5',
      timestamp: '3 hours ago',
      user: 'Tom Wilson',
      status: 'success',
    },
    {
      id: '7',
      type: 'schedule_update',
      title: 'Schedule Updated',
      description: 'Berth allocation optimized for next 24 hours',
      timestamp: '4 hours ago',
      user: 'AI System',
      status: 'info',
    },
    {
      id: '8',
      type: 'task_completed',
      title: 'Inspection Complete',
      description: 'Safety inspection passed for Berth 2',
      timestamp: '5 hours ago',
      user: 'Safety Team',
      status: 'success',
    },
  ], []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'ship_arrival':
        return <DirectionsBoat fontSize="small" />;
      case 'ship_departure':
        return <LocalShipping fontSize="small" />;
      case 'task_completed':
        return <CheckCircle fontSize="small" />;
      case 'task_assigned':
        return <Assignment fontSize="small" />;
      case 'alert':
        return <Warning fontSize="small" />;
      case 'maintenance':
        return <Build fontSize="small" />;
      case 'schedule_update':
        return <Schedule fontSize="small" />;
      default:
        return <CheckCircle fontSize="small" />;
    }
  };

  const getActivityColor = (status?: Activity['status']) => {
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'info':
      default:
        return theme.palette.info.main;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Real-time updates from port operations
          </Typography>
        </Box>

        {/* Activity Timeline */}
        <Box
          sx={{
            position: 'relative',
            maxHeight: 600,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: '3px',
            },
          }}
        >
          {/* Timeline Line */}
          <Box
            sx={{
              position: 'absolute',
              left: 19,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: theme.palette.divider,
            }}
          />

          {/* Activities */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activities.map((activity, index) => (
              <Box
                key={activity.id}
                sx={{
                  position: 'relative',
                  pl: 5,
                  pb: index === activities.length - 1 ? 0 : 2,
                }}
              >
                {/* Timeline Dot */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: 4,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: getActivityColor(activity.status),
                    border: `3px solid ${theme.palette.background.paper}`,
                    boxShadow: `0 0 0 2px ${getActivityColor(activity.status)}`,
                    zIndex: 1,
                  }}
                />

                {/* Activity Card */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: theme.shadows[2],
                      borderColor: getActivityColor(activity.status),
                    },
                  }}
                >
                  {/* Activity Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(getActivityColor(activity.status), 0.1),
                        color: getActivityColor(activity.status),
                        flexShrink: 0,
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {activity.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: '0.8rem',
                          lineHeight: 1.4,
                        }}
                      >
                        {activity.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Activity Footer */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 1.5,
                      pt: 1.5,
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {/* User */}
                    {activity.user && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: alpha(getActivityColor(activity.status), 0.2),
                            color: getActivityColor(activity.status),
                          }}
                        >
                          {getInitials(activity.user)}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {activity.user}
                        </Typography>
                      </Box>
                    )}

                    {/* Timestamp */}
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {activity.timestamp}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Load More */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
          }}
        >
          <Chip
            label="Load More Activities"
            size="small"
            clickable
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
