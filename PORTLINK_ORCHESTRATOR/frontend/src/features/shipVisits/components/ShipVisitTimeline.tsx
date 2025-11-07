import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Chip,
} from '@mui/material';
import {
  Schedule,
  Autorenew,
  Done,
  Flight,
  Cancel,
  Anchor,
  Person,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { ShipVisitStatus } from '../shipVisitsSlice';

// ============================================================================
// TYPES
// ============================================================================

export interface TimelineEvent {
  id: string;
  timestamp: string;
  status: ShipVisitStatus;
  description: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  isSystemEvent: boolean;
}

interface ShipVisitTimelineProps {
  events: TimelineEvent[];
  shipVisitId?: string;
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const STATUS_CONFIG: Record<
  ShipVisitStatus,
  { color: string; bgColor: string; icon: React.ReactNode; label: string }
> = {
  PLANNED: {
    color: '#1976d2',
    bgColor: '#e3f2fd',
    icon: <Schedule />,
    label: 'Planned',
  },
  ARRIVED: {
    color: '#2e7d32',
    bgColor: '#e8f5e9',
    icon: <Anchor />,
    label: 'Arrived',
  },
  IN_PROGRESS: {
    color: '#ed6c02',
    bgColor: '#fff4e5',
    icon: <Autorenew />,
    label: 'In Progress',
  },
  COMPLETED: {
    color: '#9c27b0',
    bgColor: '#f3e5f5',
    icon: <Done />,
    label: 'Completed',
  },
  DEPARTED: {
    color: '#607d8b',
    bgColor: '#eceff1',
    icon: <Flight />,
    label: 'Departed',
  },
  CANCELLED: {
    color: '#d32f2f',
    bgColor: '#ffebee',
    icon: <Cancel />,
    label: 'Cancelled',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

const ShipVisitTimeline: React.FC<ShipVisitTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No timeline events to display
        </Typography>
      </Box>
    );
  }

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Timeline position="right">
      {sortedEvents.map((event, index) => {
        const config = STATUS_CONFIG[event.status];
        const isLast = index === sortedEvents.length - 1;

        return (
          <TimelineItem key={event.id}>
            {/* Timestamp on opposite side */}
            <TimelineOppositeContent
              sx={{ 
                flex: 0.3,
                py: 2,
                px: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {format(new Date(event.timestamp), 'PPp')}
              </Typography>
            </TimelineOppositeContent>

            {/* Timeline separator with dot and connector */}
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  bgcolor: event.isSystemEvent ? '#9e9e9e' : config.color,
                  boxShadow: event.isSystemEvent
                    ? 'none'
                    : `0 0 0 4px ${config.bgColor}`,
                  p: 1.5,
                }}
              >
                {config.icon}
              </TimelineDot>
              {!isLast && <TimelineConnector />}
            </TimelineSeparator>

            {/* Content */}
            <TimelineContent sx={{ py: 2, px: 2 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderLeft: `4px solid ${config.color}`,
                  bgcolor: event.isSystemEvent ? '#fafafa' : 'background.paper',
                }}
              >
                {/* Status badge */}
                <Box sx={{ mb: 1 }}>
                  <Chip
                    label={config.label}
                    size="small"
                    sx={{
                      bgcolor: config.bgColor,
                      color: config.color,
                      fontWeight: 'medium',
                    }}
                  />
                </Box>

                {/* Description */}
                <Typography variant="body1" fontWeight="medium" gutterBottom>
                  {event.description}
                </Typography>

                {/* User info (for manual events) */}
                {!event.isSystemEvent && event.user && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 1.5,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: config.color,
                        fontSize: '0.875rem',
                      }}
                    >
                      {event.user.avatar ? (
                        <img
                          src={event.user.avatar}
                          alt={event.user.name}
                          style={{ width: '100%', height: '100%' }}
                        />
                      ) : (
                        <Person fontSize="small" />
                      )}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      Updated by {event.user.name}
                    </Typography>
                  </Box>
                )}

                {/* System event indicator */}
                {event.isSystemEvent && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}
                  >
                    Automatic system event
                  </Typography>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default ShipVisitTimeline;
