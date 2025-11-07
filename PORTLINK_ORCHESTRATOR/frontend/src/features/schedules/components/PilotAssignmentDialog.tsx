import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Person as PilotIcon,
  CheckCircle as AvailableIcon,
  Schedule as BusyIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Pilot {
  id: string;
  name: string;
  licenseNumber: string;
  certifications: string[];
  experience: number; // years
  rating: number; // 1-5
  availability: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
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

interface PilotAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (pilotId: string, type: 'ARRIVAL' | 'DEPARTURE') => void;
  scheduleId: string;
  vesselName?: string;
  eta?: Date;
  etd?: Date;
}

// Mock pilot data
const MOCK_PILOTS: Pilot[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    licenseNumber: 'PIL-VN-2015-001',
    certifications: ['Container Ships', 'Tankers', 'Bulk Carriers'],
    experience: 15,
    rating: 5,
    availability: 'AVAILABLE',
    upcomingSchedules: [
      {
        vesselName: 'MSC OSCAR',
        startTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '2',
    name: 'Trần Minh B',
    licenseNumber: 'PIL-VN-2018-042',
    certifications: ['Container Ships', 'Ro-Ro', 'General Cargo'],
    experience: 8,
    rating: 4,
    availability: 'BUSY',
    currentAssignment: {
      vesselName: 'EVER GOLDEN',
      eta: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    upcomingSchedules: [],
  },
  {
    id: '3',
    name: 'Lê Thị C',
    licenseNumber: 'PIL-VN-2020-088',
    certifications: ['Container Ships', 'Reefer'],
    experience: 5,
    rating: 4,
    availability: 'AVAILABLE',
    upcomingSchedules: [],
  },
  {
    id: '4',
    name: 'Phạm Đức D',
    licenseNumber: 'PIL-VN-2012-015',
    certifications: ['Container Ships', 'Tankers', 'LNG Carriers', 'Heavy Lift'],
    experience: 20,
    rating: 5,
    availability: 'AVAILABLE',
    upcomingSchedules: [
      {
        vesselName: 'COSCO VIRGO',
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
      },
      {
        vesselName: 'PACIFIC HARMONY',
        startTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '5',
    name: 'Hoàng Minh E',
    licenseNumber: 'PIL-VN-2021-102',
    certifications: ['Container Ships', 'General Cargo'],
    experience: 3,
    rating: 3,
    availability: 'OFF_DUTY',
    upcomingSchedules: [],
  },
];

export const PilotAssignmentDialog: React.FC<PilotAssignmentDialogProps> = ({
  open,
  onClose,
  onAssign,
  scheduleId,
  vesselName,
  eta,
  etd,
}) => {
  const [selectedPilotId, setSelectedPilotId] = useState<string>('');
  const [pilotType, setPilotType] = useState<'ARRIVAL' | 'DEPARTURE'>('ARRIVAL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAssign = () => {
    if (selectedPilotId) {
      onAssign(selectedPilotId, pilotType);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedPilotId('');
    setSearchQuery('');
    onClose();
  };

  const getAvailabilityIcon = (availability: Pilot['availability']) => {
    switch (availability) {
      case 'AVAILABLE':
        return <AvailableIcon sx={{ color: 'success.main' }} />;
      case 'BUSY':
        return <BusyIcon sx={{ color: 'warning.main' }} />;
      case 'OFF_DUTY':
        return <WarningIcon sx={{ color: 'error.main' }} />;
    }
  };

  const getAvailabilityColor = (availability: Pilot['availability']) => {
    switch (availability) {
      case 'AVAILABLE':
        return 'success';
      case 'BUSY':
        return 'warning';
      case 'OFF_DUTY':
        return 'error';
    }
  };

  const filteredPilots = MOCK_PILOTS.filter((pilot) =>
    pilot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pilot.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPilot = MOCK_PILOTS.find((p) => p.id === selectedPilotId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PilotIcon />
          Assign Pilot
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Schedule Info */}
        {vesselName && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">{vesselName}</Typography>
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

        {/* Pilot Type Selection */}
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Pilot Service Type</FormLabel>
          <RadioGroup
            row
            value={pilotType}
            onChange={(e) => setPilotType(e.target.value as 'ARRIVAL' | 'DEPARTURE')}
          >
            <FormControlLabel value="ARRIVAL" control={<Radio />} label="Arrival (Inbound)" />
            <FormControlLabel value="DEPARTURE" control={<Radio />} label="Departure (Outbound)" />
          </RadioGroup>
        </FormControl>

        {/* Search */}
        <TextField
          fullWidth
          label="Search Pilots"
          placeholder="Search by name or license number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Pilot List */}
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredPilots.map((pilot) => (
            <React.Fragment key={pilot.id}>
              <ListItem
                button
                selected={selectedPilotId === pilot.id}
                onClick={() => setSelectedPilotId(pilot.id)}
                sx={{
                  border: selectedPilotId === pilot.id ? 2 : 1,
                  borderColor: selectedPilotId === pilot.id ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PilotIcon />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{pilot.name}</Typography>
                      {Array.from({ length: pilot.rating }).map((_, i) => (
                        <StarIcon key={i} sx={{ fontSize: 16, color: 'warning.main' }} />
                      ))}
                      <Chip
                        label={pilot.availability}
                        size="small"
                        color={getAvailabilityColor(pilot.availability)}
                        icon={getAvailabilityIcon(pilot.availability)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        License: {pilot.licenseNumber} | Experience: {pilot.experience} years
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        {pilot.certifications.map((cert) => (
                          <Chip key={cert} label={cert} size="small" variant="outlined" />
                        ))}
                      </Box>
                      {pilot.currentAssignment && (
                        <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                          Currently assigned to {pilot.currentAssignment.vesselName} (ETA: {format(pilot.currentAssignment.eta, 'HH:mm')})
                        </Typography>
                      )}
                      {pilot.upcomingSchedules.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {pilot.upcomingSchedules.length} upcoming assignment(s)
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>

        {filteredPilots.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No pilots found matching your search criteria.
          </Alert>
        )}

        {/* Selected Pilot Details */}
        {selectedPilot && (
          <Card sx={{ mt: 2, bgcolor: 'action.hover' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Selected Pilot Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{selectedPilot.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    License Number
                  </Typography>
                  <Typography variant="body1">{selectedPilot.licenseNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Experience
                  </Typography>
                  <Typography variant="body1">{selectedPilot.experience} years</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {Array.from({ length: selectedPilot.rating }).map((_, i) => (
                      <StarIcon key={i} sx={{ fontSize: 20, color: 'warning.main' }} />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Certifications
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedPilot.certifications.map((cert) => (
                      <Chip key={cert} label={cert} size="small" color="primary" />
                    ))}
                  </Box>
                </Grid>

                {selectedPilot.upcomingSchedules.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Upcoming Schedules
                    </Typography>
                    {selectedPilot.upcomingSchedules.map((schedule, index) => (
                      <Alert key={index} severity="info" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          {schedule.vesselName}
                        </Typography>
                        <Typography variant="caption">
                          {format(schedule.startTime, 'PPp')} - {format(schedule.endTime, 'p')}
                        </Typography>
                      </Alert>
                    ))}
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={!selectedPilotId}
          startIcon={<PilotIcon />}
        >
          Assign Pilot
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PilotAssignmentDialog;
