import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  Anchor as BerthIcon,
  CheckCircle as AvailableIcon,
  Warning as OccupiedIcon,
  Build as MaintenanceIcon,
  Assignment as AssignIcon,
  SwapHoriz as SwapIcon,
  Info as InfoIcon,
  DirectionsBoat as ShipIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Berth {
  id: string;
  name: string;
  code: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  maxLength: number;
  maxDraft: number;
  capabilities: string[];
  currentShip?: {
    id: string;
    name: string;
    eta: string;
    etd: string;
  };
  upcomingSchedules?: Array<{
    id: string;
    shipName: string;
    startTime: string;
    endTime: string;
  }>;
}

interface BerthAllocationPanelProps {
  berths: Berth[];
  onAssignBerth: (berthId: string, scheduleId: string) => void;
  onSwapBerths: (berth1Id: string, berth2Id: string) => void;
  onReleaseBerth: (berthId: string) => void;
}

const mockBerths: Berth[] = [
  {
    id: '1',
    name: 'Container Terminal 1',
    code: 'CT1',
    status: 'OCCUPIED',
    maxLength: 366,
    maxDraft: 16,
    capabilities: ['Container', 'Bulk', 'Ro-Ro'],
    currentShip: {
      id: 's1',
      name: 'COSCO SHIPPING VIRGO',
      eta: '2025-11-02T08:00:00Z',
      etd: '2025-11-04T18:00:00Z',
    },
    upcomingSchedules: [
      {
        id: 'sch1',
        shipName: 'MSC OSCAR',
        startTime: '2025-11-05T06:00:00Z',
        endTime: '2025-11-06T20:00:00Z',
      },
    ],
  },
  {
    id: '2',
    name: 'Container Terminal 2',
    code: 'CT2',
    status: 'OCCUPIED',
    maxLength: 395,
    maxDraft: 16.5,
    capabilities: ['Container', 'Heavy Lift'],
    currentShip: {
      id: 's2',
      name: 'MSC OSCAR',
      eta: '2025-11-01T10:00:00Z',
      etd: '2025-11-06T16:00:00Z',
    },
  },
  {
    id: '3',
    name: 'Container Terminal 3',
    code: 'CT3',
    status: 'RESERVED',
    maxLength: 320,
    maxDraft: 14,
    capabilities: ['Container'],
    upcomingSchedules: [
      {
        id: 'sch2',
        shipName: 'PACIFIC HARMONY',
        startTime: '2025-11-04T08:00:00Z',
        endTime: '2025-11-07T14:00:00Z',
      },
    ],
  },
  {
    id: '4',
    name: 'Container Terminal 4',
    code: 'CT4',
    status: 'OCCUPIED',
    maxLength: 334,
    maxDraft: 14.5,
    capabilities: ['Container', 'Reefer'],
    currentShip: {
      id: 's3',
      name: 'EVER GOLDEN',
      eta: '2025-11-03T06:00:00Z',
      etd: '2025-11-04T22:00:00Z',
    },
  },
  {
    id: '5',
    name: 'Container Terminal 5',
    code: 'CT5',
    status: 'AVAILABLE',
    maxLength: 300,
    maxDraft: 13,
    capabilities: ['Container'],
  },
  {
    id: '6',
    name: 'Container Terminal 6',
    code: 'CT6',
    status: 'AVAILABLE',
    maxLength: 347,
    maxDraft: 15,
    capabilities: ['Container', 'Bulk'],
  },
  {
    id: '7',
    name: 'Barge Berth 1',
    code: 'BG1',
    status: 'OCCUPIED',
    maxLength: 100,
    maxDraft: 6,
    capabilities: ['Barge', 'General Cargo'],
    currentShip: {
      id: 's7',
      name: 'SÀ LAN ĐỒNG NAI 01',
      eta: '2025-11-02T14:00:00Z',
      etd: '2025-11-03T10:00:00Z',
    },
  },
  {
    id: '8',
    name: 'Maintenance Berth',
    code: 'MB1',
    status: 'MAINTENANCE',
    maxLength: 250,
    maxDraft: 12,
    capabilities: ['Maintenance', 'Repair'],
  },
];

export const BerthAllocationPanel: React.FC<BerthAllocationPanelProps> = ({
  berths = mockBerths,
  onAssignBerth,
  onSwapBerths,
  onReleaseBerth,
}) => {
  const [selectedBerth, setSelectedBerth] = useState<Berth | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <AvailableIcon color="success" />;
      case 'OCCUPIED':
        return <OccupiedIcon color="warning" />;
      case 'MAINTENANCE':
        return <MaintenanceIcon color="error" />;
      case 'RESERVED':
        return <InfoIcon color="info" />;
      default:
        return <BerthIcon />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'OCCUPIED':
        return 'warning';
      case 'MAINTENANCE':
        return 'error';
      case 'RESERVED':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleBerthClick = (berth: Berth) => {
    setSelectedBerth(berth);
    setDetailDialogOpen(true);
  };

  const handleAssignClick = (berth: Berth) => {
    setSelectedBerth(berth);
    setAssignDialogOpen(true);
  };

  const availableCount = berths.filter((b) => b.status === 'AVAILABLE').length;
  const occupiedCount = berths.filter((b) => b.status === 'OCCUPIED').length;
  const reservedCount = berths.filter((b) => b.status === 'RESERVED').length;
  const maintenanceCount = berths.filter((b) => b.status === 'MAINTENANCE').length;

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                {availableCount}
              </Avatar>
              <Typography variant="h6">{availableCount}</Typography>
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                {occupiedCount}
              </Avatar>
              <Typography variant="h6">{occupiedCount}</Typography>
              <Typography variant="body2" color="text.secondary">
                Occupied
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                {reservedCount}
              </Avatar>
              <Typography variant="h6">{reservedCount}</Typography>
              <Typography variant="body2" color="text.secondary">
                Reserved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                {maintenanceCount}
              </Avatar>
              <Typography variant="h6">{maintenanceCount}</Typography>
              <Typography variant="body2" color="text.secondary">
                Maintenance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Berth Grid */}
      <Grid container spacing={2}>
        {berths.map((berth) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={berth.id}>
            <Card
              variant="outlined"
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                },
                borderLeft: 4,
                borderLeftColor: `${getStatusColor(berth.status)}.main`,
              }}
              onClick={() => handleBerthClick(berth)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: `${getStatusColor(berth.status)}.light` }}>
                      {getStatusIcon(berth.status)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {berth.code}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {berth.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={berth.status}
                    size="small"
                    color={getStatusColor(berth.status)}
                  />
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Max Length: {berth.maxLength}m | Draft: {berth.maxDraft}m
                  </Typography>
                </Box>

                {berth.currentShip && (
                  <Box
                    sx={{
                      bgcolor: 'action.hover',
                      p: 1,
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <ShipIcon fontSize="small" />
                      <Typography variant="caption" fontWeight="bold">
                        {berth.currentShip.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      ETD: {format(new Date(berth.currentShip.etd), 'MMM d, HH:mm')}
                    </Typography>
                  </Box>
                )}

                {berth.upcomingSchedules && berth.upcomingSchedules.length > 0 && (
                  <Alert severity="info" sx={{ py: 0.5, fontSize: '0.75rem' }}>
                    {berth.upcomingSchedules.length} upcoming schedule(s)
                  </Alert>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                <Button
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBerthClick(berth);
                  }}
                >
                  Details
                </Button>
                {berth.status === 'AVAILABLE' && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AssignIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignClick(berth);
                    }}
                  >
                    Assign
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Berth Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BerthIcon />
            <Typography variant="h6">
              {selectedBerth?.code} - {selectedBerth?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedBerth && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Status
              </Typography>
              <Chip
                label={selectedBerth.status}
                color={getStatusColor(selectedBerth.status)}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" gutterBottom>
                Specifications
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Maximum Length" secondary={`${selectedBerth.maxLength} meters`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Maximum Draft" secondary={`${selectedBerth.maxDraft} meters`} />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Capabilities"
                    secondary={selectedBerth.capabilities.join(', ')}
                  />
                </ListItem>
              </List>

              {selectedBerth.currentShip && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Current Vessel
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">{selectedBerth.currentShip.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ETA: {format(new Date(selectedBerth.currentShip.eta), 'PPpp')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ETD: {format(new Date(selectedBerth.currentShip.etd), 'PPpp')}
                      </Typography>
                    </CardContent>
                  </Card>
                </>
              )}

              {selectedBerth.upcomingSchedules && selectedBerth.upcomingSchedules.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Upcoming Schedules
                  </Typography>
                  {selectedBerth.upcomingSchedules.map((schedule) => (
                    <Card key={schedule.id} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent>
                        <Typography variant="subtitle2">{schedule.shipName}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {format(new Date(schedule.startTime), 'PPp')} -{' '}
                          {format(new Date(schedule.endTime), 'PPp')}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Berth Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Berth {selectedBerth?.code}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Select Schedule"
            sx={{ mt: 2 }}
          >
            <MenuItem value="sch1">Schedule 1 - MSC OSCAR</MenuItem>
            <MenuItem value="sch2">Schedule 2 - EVER GOLDEN</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAssignDialogOpen(false)}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BerthAllocationPanel;
