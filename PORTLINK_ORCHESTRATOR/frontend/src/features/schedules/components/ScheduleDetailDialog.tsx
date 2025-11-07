import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Alert,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  DirectionsBoat as ShipIcon,
  Anchor as BerthIcon,
  Construction as CraneIcon,
  Assignment as TaskIcon,
  Warning as WarningIcon,
  Person as PilotIcon,
  DirectionsBoat as TugboatIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Schedule } from '../types/index';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface ScheduleDetailDialogProps {
  open: boolean;
  schedule: Schedule | null;
  onClose: () => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
  onStart: (schedule: Schedule) => void;
  onComplete: (schedule: Schedule) => void;
  onCancel: (schedule: Schedule) => void;
}

export const ScheduleDetailDialog: React.FC<ScheduleDetailDialogProps> = ({
  open,
  schedule,
  onClose,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onCancel,
}) => {
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open) {
      setTabValue(0);
    }
  }, [open]);

  if (!schedule) {
    return null;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'SCHEDULED':
        return 'primary';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SHIP_ARRIVAL':
        return <ShipIcon />;
      case 'MAINTENANCE':
        return <CraneIcon />;
      case 'PORT_OPERATION':
        return <BerthIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const duration = new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

  const completionPercentage = schedule.completionPercentage || 0;
  const isPast = new Date(schedule.endTime) < new Date();
  const isActive = schedule.status === 'IN_PROGRESS' || schedule.status === 'SCHEDULED';
  const cranes = schedule.resources?.cranes ?? [];
  const personnel = schedule.resources?.personnel ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getTypeIcon(schedule.type)}
            <Typography variant="h6">{schedule.operation || 'Schedule Details'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {schedule.status === 'PENDING' && (
              <Tooltip title="Start Schedule">
                <IconButton color="success" onClick={() => onStart(schedule)}>
                  <StartIcon />
                </IconButton>
              </Tooltip>
            )}
            {schedule.status === 'IN_PROGRESS' && (
              <Tooltip title="Complete Schedule">
                <IconButton color="primary" onClick={() => onComplete(schedule)}>
                  <CompleteIcon />
                </IconButton>
              </Tooltip>
            )}
            {isActive && (
              <Tooltip title="Cancel Schedule">
                <IconButton color="error" onClick={() => onCancel(schedule)}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Edit Schedule">
              <IconButton onClick={() => onEdit(schedule)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Schedule">
              <IconButton color="error" onClick={() => onDelete(schedule)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Chip label={schedule.status} color={getStatusColor(schedule.status)} size="small" />
          {isPast && schedule.status !== 'COMPLETED' && (
            <Chip label="OVERDUE" color="error" size="small" sx={{ ml: 1 }} />
          )}
          {(schedule.priority ?? 0) > 5 && (
            <Chip label="HIGH PRIORITY" color="warning" size="small" sx={{ ml: 1 }} />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" icon={<ScheduleIcon />} iconPosition="start" />
            <Tab label="Resources" icon={<CraneIcon />} iconPosition="start" />
            <Tab label="Tasks" icon={<TaskIcon />} iconPosition="start" />
            <Tab label="Timeline" icon={<TimelineIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Time Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ScheduleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Time Schedule
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <StartIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Start Time"
                        secondary={format(new Date(schedule.startTime), 'PPpp')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CompleteIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="End Time"
                        secondary={format(new Date(schedule.endTime), 'PPpp')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Duration"
                        secondary={`${hours}h ${minutes}m`}
                      />
                    </ListItem>
                    {schedule.actualStartTime && (
                      <ListItem>
                        <ListItemIcon>
                          <CompleteIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Actual Start"
                          secondary={format(new Date(schedule.actualStartTime), 'PPpp')}
                        />
                      </ListItem>
                    )}
                    {schedule.actualEndTime && (
                      <ListItem>
                        <ListItemIcon>
                          <CompleteIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Actual End"
                          secondary={format(new Date(schedule.actualEndTime), 'PPpp')}
                        />
                      </ListItem>
                    )}
                  </List>

                  {schedule.status === 'IN_PROGRESS' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Progress: {completionPercentage}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={completionPercentage}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Ship & Berth Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ShipIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Allocation Details
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {schedule.shipVisit && (
                      <>
                        <ListItem>
                          <ListItemIcon>
                            <ShipIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Ship Visit"
                            secondary={schedule.shipVisit.vesselName || 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <ShipIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="IMO Number"
                            secondary={schedule.shipVisit.vesselIMO || 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <TaskIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Voyage"
                            secondary={schedule.shipVisit.voyageNumber || 'N/A'}
                          />
                        </ListItem>
                      </>
                    )}
                    {schedule.resources?.berthId && (
                      <ListItem>
                        <ListItemIcon>
                          <BerthIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Berth"
                          secondary={schedule.resources?.berthName || schedule.resources.berthId}
                        />
                      </ListItem>
                    )}
                    {schedule.resources?.pilotRequired && (
                      <ListItem>
                        <ListItemIcon>
                          <PilotIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Pilot"
                          secondary={schedule.resources.pilotName || 'Required'}
                        />
                      </ListItem>
                    )}
                    {schedule.resources?.tugboatCount && (
                      <ListItem>
                        <ListItemIcon>
                          <TugboatIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Tugboats"
                          secondary={`${schedule.resources.tugboatCount} required`}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Notes & Description */}
            {schedule.notes && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Notes
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary" style={{ whiteSpace: 'pre-wrap' }}>
                      {schedule.notes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Warnings & Conflicts */}
            {schedule.status !== 'COMPLETED' && schedule.status !== 'CANCELLED' && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<WarningIcon />}>
                  <Typography variant="body2">
                    No conflicts detected for this schedule.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Allocated Resources
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    <CraneIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Cranes
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {cranes.length > 0 ? (
                    <List dense>
                      {cranes.map((crane: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={crane.name || crane.id}
                            secondary={`Capacity: ${crane.capacity || 'N/A'}`}
                          />
                          <Chip label={crane.status || 'Available'} size="small" color="success" />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No cranes allocated
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    <PilotIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Personnel
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {personnel.length > 0 ? (
                    <List dense>
                      {personnel.map((person: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={person.name}
                            secondary={person.role}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No personnel assigned
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Related Tasks
          </Typography>
          {schedule.tasks && schedule.tasks.length > 0 ? (
            <List>
              {schedule.tasks.map((task: any) => (
                <Card key={task.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">{task.taskName}</Typography>
                      <Chip label={task.status} size="small" color={getStatusColor(task.status)} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {task.taskType}
                    </Typography>
                    {task.completionPercentage !== undefined && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption">
                          Progress: {task.completionPercentage}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={task.completionPercentage}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </List>
          ) : (
            <Alert severity="info">No tasks associated with this schedule</Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Schedule Timeline
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              Timeline visualization will be implemented with Gantt chart integration
            </Alert>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', px: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Created: {format(new Date(schedule.createdAt), 'PPpp')}
            </Typography>
          </Box>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleDetailDialog;
