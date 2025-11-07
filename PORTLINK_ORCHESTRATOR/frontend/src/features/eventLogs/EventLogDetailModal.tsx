import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Cancel as CriticalIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { EventLog, EventSeverity } from './eventLogsSlice';

interface EventLogDetailModalProps {
  eventLog: EventLog | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (eventLogId: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

export const EventLogDetailModal: React.FC<EventLogDetailModalProps> = ({
  eventLog,
  open,
  onClose,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!eventLog) return null;

  const getSeverityColor = (severity: EventSeverity) => {
    switch (severity) {
      case 'INFO':
        return 'info';
      case 'WARNING':
        return 'warning';
      case 'ERROR':
        return 'error';
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: EventSeverity) => {
    switch (severity) {
      case 'INFO':
        return <InfoIcon />;
      case 'WARNING':
        return <WarningIcon />;
      case 'ERROR':
        return <ErrorIcon />;
      case 'CRITICAL':
        return <CriticalIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Event Log Details</Typography>
            <Chip
              icon={getSeverityIcon(eventLog.severity)}
              label={eventLog.severity}
              color={getSeverityColor(eventLog.severity) as any}
              size="small"
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {/* Tabs */}
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Metadata" />
          <Tab label="Technical" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Event Type
              </Typography>
              <Typography variant="body1">{eventLog.eventType.replace(/_/g, ' ')}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">{eventLog.description}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                User
              </Typography>
              <Typography variant="body1">
                {eventLog.user ? (
                  <>
                    {eventLog.user.username} ({eventLog.user.email})
                  </>
                ) : (
                  'System'
                )}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Time
              </Typography>
              <Typography variant="body1">
                {format(new Date(eventLog.createdAt), 'MMMM d, yyyy HH:mm:ss')}
              </Typography>
            </Box>

            {eventLog.entityType && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Entity
                </Typography>
                <Typography variant="body1">
                  {eventLog.entityType}
                  {eventLog.entityId && (
                    <Typography
                      component="span"
                      sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}
                    >
                      ({eventLog.entityId})
                    </Typography>
                  )}
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Metadata Tab */}
        <TabPanel value={activeTab} index={1}>
          {eventLog.metadata ? (
            <Box
              sx={{
                backgroundColor: 'grey.50',
                p: 2,
                borderRadius: 1,
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              <pre style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                {JSON.stringify(eventLog.metadata, null, 2)}
              </pre>
            </Box>
          ) : (
            <Typography color="text.secondary">No metadata available</Typography>
          )}
        </TabPanel>

        {/* Technical Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Event ID
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {eventLog.id}
              </Typography>
            </Box>

            {eventLog.ipAddress && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  IP Address
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {eventLog.ipAddress}
                </Typography>
              </Box>
            )}

            {eventLog.userAgent && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  User Agent
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {eventLog.userAgent}
                </Typography>
              </Box>
            )}

            {eventLog.userId && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {eventLog.userId}
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        {onDelete && (
          <Button startIcon={<DeleteIcon />} color="error" onClick={() => onDelete(eventLog.id)}>
            Delete
          </Button>
        )}
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventLogDetailModal;
