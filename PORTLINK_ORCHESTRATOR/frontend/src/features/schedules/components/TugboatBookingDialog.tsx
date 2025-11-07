import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
} from '@mui/material';
import {
  DirectionsBoat as TugboatIcon,
  CheckCircle as AvailableIcon,
  Schedule as BusyIcon,
  Build as MaintenanceIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Tugboat {
  id: string;
  name: string;
  registrationNumber: string;
  bollardPull: number; // tonnes
  type: 'HARBOR' | 'OCEAN' | 'RIVER';
  status: 'AVAILABLE' | 'BUSY' | 'MAINTENANCE';
  currentAssignment?: {
    vesselName: string;
    eta: Date;
  };
  upcomingSchedules: {
    vesselName: string;
    startTime: Date;
    endTime: Date;
  }[];
}

interface TugboatBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onBook: (tugboatIds: string[], count: number) => void;
  scheduleId: string;
  vesselName?: string;
  vesselSize?: number; // LOA in meters
  eta?: Date;
  etd?: Date;
}

// Mock tugboat data
const MOCK_TUGBOATS: Tugboat[] = [
  {
    id: '1',
    name: 'TÀU KÉO CL-01',
    registrationNumber: 'TUG-VN-2020-01',
    bollardPull: 50,
    type: 'HARBOR',
    status: 'AVAILABLE',
    upcomingSchedules: [],
  },
  {
    id: '2',
    name: 'TÀU KÉO CL-02',
    registrationNumber: 'TUG-VN-2020-02',
    bollardPull: 55,
    type: 'HARBOR',
    status: 'AVAILABLE',
    upcomingSchedules: [
      {
        vesselName: 'MSC OSCAR',
        startTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 7 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '3',
    name: 'TÀU KÉO CL-03',
    registrationNumber: 'TUG-VN-2019-03',
    bollardPull: 45,
    type: 'HARBOR',
    status: 'BUSY',
    currentAssignment: {
      vesselName: 'EVER GOLDEN',
      eta: new Date(Date.now() + 1 * 60 * 60 * 1000),
    },
    upcomingSchedules: [],
  },
  {
    id: '4',
    name: 'TÀU KÉO CL-04',
    registrationNumber: 'TUG-VN-2021-04',
    bollardPull: 60,
    type: 'OCEAN',
    status: 'AVAILABLE',
    upcomingSchedules: [],
  },
  {
    id: '5',
    name: 'TÀU KÉO CL-05',
    registrationNumber: 'TUG-VN-2018-05',
    bollardPull: 40,
    type: 'RIVER',
    status: 'AVAILABLE',
    upcomingSchedules: [],
  },
  {
    id: '6',
    name: 'TÀU KÉO CL-06',
    registrationNumber: 'TUG-VN-2022-06',
    bollardPull: 65,
    type: 'OCEAN',
    status: 'MAINTENANCE',
    upcomingSchedules: [],
  },
  {
    id: '7',
    name: 'TÀU KÉO CL-07',
    registrationNumber: 'TUG-VN-2021-07',
    bollardPull: 52,
    type: 'HARBOR',
    status: 'AVAILABLE',
    upcomingSchedules: [
      {
        vesselName: 'COSCO VIRGO',
        startTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '8',
    name: 'TÀU KÉO CL-08',
    registrationNumber: 'TUG-VN-2020-08',
    bollardPull: 48,
    type: 'HARBOR',
    status: 'BUSY',
    currentAssignment: {
      vesselName: 'PACIFIC HARMONY',
      eta: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    upcomingSchedules: [],
  },
];

export const TugboatBookingDialog: React.FC<TugboatBookingDialogProps> = ({
  open,
  onClose,
  onBook,
  scheduleId,
  vesselName,
  vesselSize,
  eta,
  etd,
}) => {
  const [selectedTugboatIds, setSelectedTugboatIds] = useState<string[]>([]);
  const [requiredCount, setRequiredCount] = useState<number>(2);
  const [filterType, setFilterType] = useState<'ALL' | 'HARBOR' | 'OCEAN' | 'RIVER'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'AVAILABLE' | 'BUSY'>('AVAILABLE');

  const handleBook = () => {
    if (selectedTugboatIds.length > 0) {
      onBook(selectedTugboatIds, requiredCount);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedTugboatIds([]);
    setRequiredCount(2);
    onClose();
  };

  const handleToggleTugboat = (id: string) => {
    setSelectedTugboatIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((tid) => tid !== id);
      } else if (prev.length < requiredCount) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const getStatusIcon = (status: Tugboat['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return <AvailableIcon sx={{ color: 'success.main' }} />;
      case 'BUSY':
        return <BusyIcon sx={{ color: 'warning.main' }} />;
      case 'MAINTENANCE':
        return <MaintenanceIcon sx={{ color: 'error.main' }} />;
    }
  };

  const getStatusColor = (status: Tugboat['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'BUSY':
        return 'warning';
      case 'MAINTENANCE':
        return 'error';
    }
  };

  const getTypeColor = (type: Tugboat['type']) => {
    switch (type) {
      case 'HARBOR':
        return 'primary';
      case 'OCEAN':
        return 'secondary';
      case 'RIVER':
        return 'info';
    }
  };

  const filteredTugboats = MOCK_TUGBOATS.filter((tugboat) => {
    if (filterType !== 'ALL' && tugboat.type !== filterType) return false;
    if (filterStatus !== 'ALL' && tugboat.status !== filterStatus) return false;
    return true;
  });

  const recommendedCount = vesselSize
    ? vesselSize > 300
      ? 3
      : vesselSize > 200
      ? 2
      : 1
    : 2;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TugboatIcon />
          Book Tugboats
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Schedule Info */}
        {vesselName && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">{vesselName}</Typography>
            {vesselSize && (
              <Typography variant="body2">
                LOA: {vesselSize}m (Recommended tugboats: {recommendedCount})
              </Typography>
            )}
            {eta && (
              <Typography variant="body2">
                ETA: {format(eta, 'PPpp')}
              </Typography>
            )}
            {etd && (
              <Typography variant="body2">
                ETD: {format(etd, 'PPpp')}
              </Typography>
            )}
          </Alert>
        )}

        {/* Tugboat Count Selection */}
        <Card sx={{ mb: 2, bgcolor: 'action.hover' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Required Number of Tugboats
            </Typography>
            <Slider
              value={requiredCount}
              onChange={(_, value) => setRequiredCount(value as number)}
              min={1}
              max={4}
              marks={[
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 4, label: '4' },
              ]}
              valueLabelDisplay="auto"
              sx={{ mt: 2 }}
            />
            <Typography variant="caption" color="text.secondary">
              Selected: {selectedTugboatIds.length} / {requiredCount}
            </Typography>
          </CardContent>
        </Card>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              label="Type"
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="HARBOR">🚢 Harbor</MenuItem>
              <MenuItem value="OCEAN">🌊 Ocean</MenuItem>
              <MenuItem value="🏞️ RIVER">River</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="AVAILABLE">✓ Available</MenuItem>
              <MenuItem value="BUSY">⏰ Busy</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Tugboat List */}
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredTugboats.map((tugboat) => {
            const isSelected = selectedTugboatIds.includes(tugboat.id);
            const isDisabled =
              tugboat.status === 'MAINTENANCE' ||
              (!isSelected && selectedTugboatIds.length >= requiredCount);

            return (
              <React.Fragment key={tugboat.id}>
                <ListItem
                  button
                  selected={isSelected}
                  onClick={() => !isDisabled && handleToggleTugboat(tugboat.id)}
                  disabled={isDisabled}
                  sx={{
                    border: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    mb: 1,
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getTypeColor(tugboat.type) + '.main' }}>
                      <TugboatIcon />
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{tugboat.name}</Typography>
                        <Chip
                          label={tugboat.type}
                          size="small"
                          color={getTypeColor(tugboat.type)}
                        />
                        <Chip
                          label={tugboat.status}
                          size="small"
                          color={getStatusColor(tugboat.status)}
                          icon={getStatusIcon(tugboat.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Registration: {tugboat.registrationNumber} | Bollard Pull: {tugboat.bollardPull}t
                        </Typography>
                        {tugboat.currentAssignment && (
                          <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                            Currently assigned to {tugboat.currentAssignment.vesselName} (ETA: {format(tugboat.currentAssignment.eta, 'HH:mm')})
                          </Typography>
                        )}
                        {tugboat.upcomingSchedules.length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {tugboat.upcomingSchedules.length} upcoming assignment(s)
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>

        {filteredTugboats.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No tugboats found matching your filter criteria.
          </Alert>
        )}

        {/* Selected Tugboats Summary */}
        {selectedTugboatIds.length > 0 && (
          <Card sx={{ mt: 2, bgcolor: 'action.hover' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Selected Tugboats ({selectedTugboatIds.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {selectedTugboatIds.map((id) => {
                  const tugboat = MOCK_TUGBOATS.find((t) => t.id === id);
                  if (!tugboat) return null;

                  return (
                    <Grid item xs={12} key={id}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="body1">{tugboat.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tugboat.type} | {tugboat.bollardPull}t Bollard Pull
                          </Typography>
                        </Box>
                        <Chip
                          label={tugboat.status}
                          size="small"
                          color={getStatusColor(tugboat.status)}
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Total Bollard Pull: {selectedTugboatIds.reduce((sum, id) => {
                    const tugboat = MOCK_TUGBOATS.find((t) => t.id === id);
                    return sum + (tugboat?.bollardPull || 0);
                  }, 0)}t
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button
          onClick={handleBook}
          variant="contained"
          disabled={selectedTugboatIds.length === 0}
          startIcon={<AddIcon />}
        >
          Book {selectedTugboatIds.length} Tugboat(s)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TugboatBookingDialog;
