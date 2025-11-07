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
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Asset } from './assetsSlice';

interface AssetDetailModalProps {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
  onStatusChange?: (assetId: string, status: string) => void;
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

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  open,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!asset) return null;

  const isMaintenanceDue = (): boolean => {
    if (!asset.nextMaintenanceDate) return false;
    const daysUntilDue = Math.ceil(
      (new Date(asset.nextMaintenanceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDue <= 7;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'IN_USE':
        return 'primary';
      case 'MAINTENANCE':
        return 'warning';
      case 'OFFLINE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CRANE':
        return '🏗️';
      case 'TRUCK':
        return '🚛';
      case 'REACH_STACKER':
        return '🏋️';
      case 'FORKLIFT':
        return '🏴';
      case 'YARD_TRACTOR':
        return '🚜';
      default:
        return '🔧';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">
              {getTypeIcon(asset.type)} {asset.name}
            </Typography>
            <Chip label={asset.assetCode} size="small" variant="outlined" />
            <Chip label={asset.status} color={getStatusColor(asset.status) as any} size="small" />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {/* Maintenance Due Warning */}
        {isMaintenanceDue() && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            Maintenance due{' '}
            {asset.nextMaintenanceDate
              ? `on ${format(new Date(asset.nextMaintenanceDate), 'MMM d, yyyy')}`
              : 'soon'}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Specifications" />
          <Tab label="Maintenance" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1">
                {getTypeIcon(asset.type)} {asset.type.replace('_', ' ')}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip label={asset.status} color={getStatusColor(asset.status) as any} size="small" />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">{asset.location || 'Not specified'}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Capacity
              </Typography>
              <Typography variant="body1">
                {asset.capacity} {asset.capacityUnit || 'units'}
              </Typography>
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="body2" color="text.secondary">
                Utilization Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={asset.utilizationRate ?? 0}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                  color={
                    (asset.utilizationRate ?? 0) > 80
                      ? 'success'
                      : (asset.utilizationRate ?? 0) > 50
                      ? 'primary'
                      : 'warning'
                  }
                />
                <Typography variant="body2" fontWeight="bold">
                  {asset.utilizationRate}%
                </Typography>
              </Box>
            </Box>

            {asset.notes && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="body2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {asset.notes}
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Specifications Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box
            sx={{
              backgroundColor: 'grey.50',
              p: 2,
              borderRadius: 1,
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <pre style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'monospace' }}>
              {JSON.stringify(
                {
                  assetCode: asset.assetCode,
                  name: asset.name,
                  type: asset.type,
                  capacity: asset.capacity,
                  capacityUnit: asset.capacityUnit,
                  location: asset.location,
                  utilizationRate: asset.utilizationRate,
                  specifications: asset.specifications,
                },
                null,
                2
              )}
            </pre>
          </Box>
        </TabPanel>

        {/* Maintenance Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Last Maintenance
              </Typography>
              <Typography variant="body1">
                {asset.lastMaintenanceDate ? (
                  <>
                    <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                    {format(new Date(asset.lastMaintenanceDate), 'MMM d, yyyy HH:mm')}
                  </>
                ) : (
                  'Not recorded'
                )}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Next Maintenance
              </Typography>
              <Typography variant="body1">
                {asset.nextMaintenanceDate ? (
                  <>
                    {isMaintenanceDue() ? (
                      <WarningIcon sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                    ) : (
                      <BuildIcon sx={{ fontSize: 16, color: 'info.main', mr: 0.5 }} />
                    )}
                    {format(new Date(asset.nextMaintenanceDate), 'MMM d, yyyy HH:mm')}
                  </>
                ) : (
                  'Not scheduled'
                )}
              </Typography>
            </Box>

            {isMaintenanceDue() && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Alert severity="warning" icon={<WarningIcon />}>
                  Maintenance is due within 7 days. Please schedule maintenance as soon as possible.
                </Alert>
              </Box>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        {onEdit && (
          <Button startIcon={<EditIcon />} onClick={() => onEdit(asset)}>
            Edit
          </Button>
        )}
        {onStatusChange && asset.status === 'AVAILABLE' && (
          <Button startIcon={<BuildIcon />} color="warning" onClick={() => onStatusChange(asset.id, 'MAINTENANCE')}>
            Maintenance
          </Button>
        )}
        {onStatusChange && asset.status === 'OFFLINE' && (
          <Button
            startIcon={<CheckCircleIcon />}
            color="success"
            onClick={() => onStatusChange(asset.id, 'AVAILABLE')}
          >
            Activate
          </Button>
        )}
        {onDelete && (
          <Button startIcon={<DeleteIcon />} color="error" onClick={() => onDelete(asset.id)}>
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

export default AssetDetailModal;
