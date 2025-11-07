import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Alert,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { Science, Delete, Visibility } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  runSimulation,
  applySimulation,
  deleteSimulation,
  clearCurrentSimulation,
  selectCurrentSimulation,
  selectRecentSimulations,
  selectSimulationLoading,
  selectSimulationApplying,
  selectSimulationError,
} from './simulationSlice';
import ScenarioForm from './components/ScenarioForm';
import SimulationResults from './components/SimulationResults';
import { useSimulationSocket } from './hooks/useSimulationSocket';
import type { CreateSimulationDto } from '@/types/simulation.types';
import { formatDistanceToNow } from 'date-fns';

/**
 * Simulation Page Component
 * 
 * What-If scenario simulation
 */
export default function SimulationPage() {
  const dispatch = useAppDispatch();
  
  // Connect to WebSocket for real-time updates
  useSimulationSocket();
  
  const currentSimulation = useAppSelector(selectCurrentSimulation);
  const recentSimulations = useAppSelector(selectRecentSimulations);
  const loading = useAppSelector(selectSimulationLoading);
  const applying = useAppSelector(selectSimulationApplying);
  const error = useAppSelector(selectSimulationError);
  const progress = useAppSelector((state) => state.simulation.progress);
  const activeSchedule = useAppSelector((state) => {
    const scheduleState = state.schedules;

    if (!scheduleState) {
      return null;
    }

    const { currentSchedule, schedules = [] } = scheduleState;

    if (currentSchedule) {
      return currentSchedule;
    }

    const inProgress = schedules.find((schedule) => schedule.status === 'IN_PROGRESS');
    if (inProgress) {
      return inProgress;
    }

    const scheduled = schedules.find((schedule) => schedule.status === 'SCHEDULED');
    if (scheduled) {
      return scheduled;
    }

    return schedules[0] ?? null;
  });

  // Mock data for ship visits and assets (should come from Redux in real app)
  const mockShipVisits = [
    { id: '1', shipName: 'MSC Oscar' },
    { id: '2', shipName: 'OOCL Hong Kong' },
    { id: '3', shipName: 'Maersk Essen' },
  ];

  const mockAssets = [
    { id: '1', name: 'Berth B-01', type: 'BERTH' },
    { id: '2', name: 'Berth B-02', type: 'BERTH' },
    { id: '3', name: 'Crane C-01', type: 'CRANE' },
    { id: '4', name: 'Crane C-02', type: 'CRANE' },
  ];

  const handleRunSimulation = async (dto: CreateSimulationDto) => {
    await dispatch(runSimulation(dto));
  };

  const handleApplySimulation = async () => {
    if (currentSimulation) {
      await dispatch(applySimulation(currentSimulation.id));
    }
  };

  const handleDiscardSimulation = () => {
    dispatch(clearCurrentSimulation());
  };

  const handleDeleteSimulation = (id: string) => {
    dispatch(deleteSimulation(id));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🧪 Simulation & What-If Scenarios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and run simulation scenarios to predict impacts and optimize operations
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearCurrentSimulation())}>
          {error}
        </Alert>
      )}

      {/* Real-time Progress */}
      {progress && (
        <Alert 
          severity={progress.status === 'failed' ? 'error' : 'info'} 
          sx={{ mb: 3 }}
          icon={progress.status === 'running' ? <Science /> : undefined}
        >
          <Box>
            <Typography variant="body2">{progress.message}</Typography>
            {progress.status === 'running' && (
              <LinearProgress sx={{ mt: 1 }} />
            )}
          </Box>
        </Alert>
      )}

      {/* No Active Schedule Warning */}
      {!activeSchedule && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No active schedule found. Please activate a schedule in the Schedules page to run simulations.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Create Simulation */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create New Simulation
            </Typography>
            
            {activeSchedule ? (
              <ScenarioForm
                onSubmit={handleRunSimulation}
                loading={loading}
                baseScheduleId={activeSchedule.id}
                shipVisits={mockShipVisits}
                assets={mockAssets}
              />
            ) : (
              <Alert severity="info" icon={<Science />}>
                Please activate a schedule to start creating simulations.
              </Alert>
            )}
          </Paper>

          {/* Simulation Results */}
          {currentSimulation && (
            <Paper sx={{ p: 3 }}>
              <SimulationResults
                result={currentSimulation}
                onApply={handleApplySimulation}
                onDiscard={handleDiscardSimulation}
                applying={applying}
              />
            </Paper>
          )}
        </Grid>

        {/* Right Column: Recent Simulations */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Simulations
              </Typography>

              {recentSimulations.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No simulations yet. Create your first scenario to get started!
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentSimulations.map((simulation) => (
                    <ListItem
                      key={simulation.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                      secondaryAction={
                        <Box>
                          <IconButton size="small" onClick={() => console.log('View', simulation.id)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteSimulation(simulation.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={simulation.name}
                        secondary={
                          <Box>
                            <Chip label={simulation.scenarioType} size="small" sx={{ mr: 1 }} />
                            <Typography variant="caption" color="text.secondary">
                              {simulation.status === 'COMPLETED' && simulation.completedAt
                                ? `Completed ${formatDistanceToNow(new Date(simulation.completedAt), { addSuffix: true })}`
                                : `Status: ${simulation.status}`}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {simulation.conflictsDetected} conflicts • {simulation.executionTimeMs}ms
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
