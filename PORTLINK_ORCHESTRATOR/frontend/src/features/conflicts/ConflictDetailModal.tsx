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
  Alert,
  TextField,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as ResolveIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Conflict, ConflictSeverity } from './conflictsSlice';

interface ConflictDetailModalProps {
  conflict: Conflict | null;
  open: boolean;
  onClose: () => void;
  onResolve?: (conflictId: string, resolutionNotes?: string) => void;
  onDelete?: (conflictId: string) => void;
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

export const ConflictDetailModal: React.FC<ConflictDetailModalProps> = ({
  conflict,
  open,
  onClose,
  onResolve,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (!conflict) return null;

  const getSeverityColor = (severity: ConflictSeverity) => {
    switch (severity) {
      case 'LOW':
        return 'info';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: ConflictSeverity) => {
    switch (severity) {
      case 'LOW':
        return <InfoIcon />;
      case 'MEDIUM':
        return <WarningIcon />;
      case 'HIGH':
        return <ErrorIcon />;
      case 'CRITICAL':
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const handleResolve = () => {
    if (onResolve) {
      onResolve(conflict.id, resolutionNotes || undefined);
      setResolutionNotes('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Conflict Details</Typography>
            <Chip
              icon={getSeverityIcon(conflict.severity)}
              label={conflict.severity}
              color={getSeverityColor(conflict.severity) as any}
              size="small"
            />
            {conflict.resolved ? (
              <Chip label="Resolved" color="success" size="small" />
            ) : (
              <Chip label="Unresolved" color="warning" size="small" />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {/* Critical Alert */}
        {conflict.severity === 'CRITICAL' && !conflict.resolved && (
          <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
            <strong>Critical Conflict!</strong> This requires immediate attention and resolution.
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Affected Resources" />
          <Tab label="Resolution" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Conflict Type
              </Typography>
              <Typography variant="body1">{conflict.conflictType.replace('_', ' ')}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">{conflict.description}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Conflict Time
              </Typography>
              <Typography variant="body1">
                {format(new Date(conflict.conflictTime), 'MMMM d, yyyy HH:mm:ss')}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Simulation Run ID
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {conflict.simulationRunId}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1">
                {format(new Date(conflict.createdAt), 'MMMM d, yyyy HH:mm:ss')}
              </Typography>
            </Box>
          </Box>
        </TabPanel>

        {/* Affected Resources Tab */}
        <TabPanel value={activeTab} index={1}>
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
              {JSON.stringify(conflict.affectedResources, null, 2)}
            </pre>
          </Box>
        </TabPanel>

        {/* Resolution Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            {conflict.suggestedResolution && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Suggested Resolution
                </Typography>
                <Box
                  sx={{
                    backgroundColor: 'info.lighter',
                    p: 2,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'info.main',
                  }}
                >
                  <pre style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                    {JSON.stringify(conflict.suggestedResolution, null, 2)}
                  </pre>
                </Box>
              </Box>
            )}

            {conflict.resolved && conflict.resolutionNotes && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Resolution Notes
                </Typography>
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  {conflict.resolutionNotes}
                </Alert>
              </Box>
            )}

            {!conflict.resolved && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Add Resolution Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Describe how this conflict was resolved..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        {!conflict.resolved && onResolve && (
          <Button startIcon={<ResolveIcon />} color="success" onClick={handleResolve} variant="contained">
            Mark as Resolved
          </Button>
        )}
        {onDelete && (
          <Button startIcon={<DeleteIcon />} color="error" onClick={() => onDelete(conflict.id)}>
            Delete
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConflictDetailModal;
