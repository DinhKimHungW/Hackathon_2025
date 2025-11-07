import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  IconButton,
  Badge,
  Avatar,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
}

// Mock notifications (replace with real data from Redux)
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Conflict Detected',
    message: 'Crane A1 assigned to multiple tasks at 14:00',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Ship Arrived',
    message: 'MSC Oscar arrived at Berth A1',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Task Completed',
    message: 'Container unloading completed for Ever Given',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <CheckIcon color="success" fontSize="small" />;
    case 'error':
      return <ErrorIcon color="error" fontSize="small" />;
    case 'warning':
      return <WarningIcon color="warning" fontSize="small" />;
    case 'info':
      return <InfoIcon color="info" fontSize="small" />;
    default:
      return <InfoIcon color="info" fontSize="small" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'success.light';
    case 'error':
      return 'error.light';
    case 'warning':
      return 'warning.light';
    case 'info':
      return 'info.light';
    default:
      return 'grey.200';
  }
};

export default function NotificationsMenu({ anchorEl, open, onClose }: NotificationsMenuProps) {
  const [notifications, setNotifications] = React.useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1.5,
          width: 380,
          maxHeight: 500,
          borderRadius: 2,
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Notifications
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              size="small"
              color="primary"
              sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
            />
          )}
        </Typography>
        {unreadCount > 0 && (
          <IconButton size="small" onClick={handleMarkAllAsRead}>
            <MarkReadIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Notifications List */}
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <Box
              key={notification.id}
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                borderLeft: notification.read ? 'none' : '3px solid',
                borderColor: getNotificationColor(notification.type),
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: getNotificationColor(notification.type),
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {notification.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {!notification.read && (
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      sx={{ opacity: 0.7 }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteNotification(notification.id)}
                    sx={{ opacity: 0.7 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <Typography
          variant="caption"
          color="primary"
          sx={{
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={onClose}
        >
          View All Notifications
        </Typography>
      </Box>
    </Menu>
  );
}
