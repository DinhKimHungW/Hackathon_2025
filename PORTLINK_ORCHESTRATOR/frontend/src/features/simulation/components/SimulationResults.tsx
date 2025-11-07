/**
 * SimulationResults Component
 * Displays simulation results with metrics, conflicts, and recommendations.
 */

import type { ReactNode } from 'react';

import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Grid,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  TrendingUp,
  TrendingDown,
  Schedule,
  Assignment,
  Lightbulb,
} from '@mui/icons-material';
import type {
  SimulationResultDto,
  ConflictDetailDto,
  RecommendationDto,
  ConflictSeverity,
} from '@/types/simulation.types';
import { CONFLICT_SEVERITY_COLORS, SimulationStatus } from '@/types/simulation.types';

interface SimulationResultsProps {
  result: SimulationResultDto;
  onApply: () => void;
  onDiscard: () => void;
  applying?: boolean;
}

const toTitleCase = (value: string) =>
  value
    .split(/[_\s]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const asNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const MetricCard = ({
  label,
  valueBefore,
  valueAfter,
  suffix = '',
  icon,
}: {
  label: string;
  valueBefore: number;
  valueAfter: number;
  suffix?: string;
  icon: ReactNode;
}) => {
  const delta = valueAfter - valueBefore;
  const isIncrease = delta > 0;
  const hasChange = delta !== 0;

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon}
          <Typography variant="subtitle2" sx={{ ml: 1 }}>
            {label}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h6" color="text.secondary">
            {valueBefore}
            {suffix}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {'->'}
          </Typography>
          <Typography variant="h5" color={hasChange ? (isIncrease ? 'error.main' : 'success.main') : 'text.primary'}>
            {valueAfter}
            {suffix}
          </Typography>
        </Box>

        {hasChange && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {isIncrease ? <TrendingUp color="error" fontSize="small" /> : <TrendingDown color="success" fontSize="small" />}
            <Typography variant="caption" color={isIncrease ? 'error.main' : 'success.main'} sx={{ ml: 0.5 }}>
              {isIncrease ? '+' : ''}
              {delta}
              {suffix} {isIncrease ? 'increase' : 'decrease'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ConflictItem = ({ conflict }: { conflict: ConflictDetailDto }) => {
  const severity: ConflictSeverity = conflict?.severity ?? 'LOW';
  const severityColor = CONFLICT_SEVERITY_COLORS[severity] ?? '#9e9e9e';

  const getSeverityIcon = (value: ConflictSeverity) => {
    switch (value) {
      case 'CRITICAL':
        return <Error color="error" />;
      case 'HIGH':
        return <Warning color="error" />;
      case 'MEDIUM':
        return <Warning color="warning" />;
      default:
        return <Warning color="info" />;
    }
  };

  const typeLabel = toTitleCase(conflict?.type ?? 'Unknown');
  const description = conflict?.description ?? 'No description provided.';
  const affectedTasks = Array.isArray(conflict?.affectedTasks) && conflict.affectedTasks.length > 0
    ? conflict.affectedTasks.join(', ')
    : 'None';

  return (
    <ListItem
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        bgcolor: 'background.paper',
      }}
    >
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {getSeverityIcon(severity)}
            <Typography variant="subtitle1" component="span">
              {typeLabel}
            </Typography>
            <Chip
              label={severity}
              size="small"
              sx={{
                bgcolor: severityColor,
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Affected Tasks: {affectedTasks}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};

const RecommendationItem = ({ recommendation }: { recommendation: RecommendationDto }) => {
  const typeLabel = toTitleCase(recommendation?.type ?? 'Recommendation');
  const description = recommendation?.description ?? 'No additional details provided.';
  const impactLabel = recommendation?.estimatedImpact ?? 'N/A';
  const confidenceDisplay =
    typeof recommendation?.confidence === 'number' && recommendation.confidence > 0
      ? `${recommendation.confidence}% confidence`
      : null;

  return (
    <ListItem
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        bgcolor: 'background.paper',
      }}
    >
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Lightbulb color="primary" />
            <Typography variant="subtitle1" component="span">
              {typeLabel}
            </Typography>
            {confidenceDisplay && <Chip label={confidenceDisplay} size="small" variant="outlined" />}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {description}
            </Typography>
            <Typography variant="caption" color="success.main">
              Impact: {impactLabel}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};

export default function SimulationResults({ result, onApply, onDiscard, applying = false }: SimulationResultsProps) {
  const status = result?.status ?? SimulationStatus.PENDING;

  const metrics = {
    totalTasks: asNumber(result?.metrics?.totalTasks),
    affectedTasks: asNumber(result?.metrics?.affectedTasks),
    totalDelayHours: asNumber(result?.metrics?.totalDelayHours),
    resourceUtilizationBefore: asNumber(result?.metrics?.resourceUtilizationBefore),
    resourceUtilizationAfter: asNumber(result?.metrics?.resourceUtilizationAfter),
  };

  const conflicts = Array.isArray(result?.conflicts) ? result.conflicts : [];
  const recommendations = Array.isArray(result?.recommendations) ? result.recommendations : [];
  const executionTimeMs = asNumber(result?.executionTimeMs);
  const conflictsDetected = typeof result?.conflictsDetected === 'number' ? result.conflictsDetected : conflicts.length;
  const slowExecution = executionTimeMs > 5000;

  const statusMeta = (() => {
    switch (status) {
      case SimulationStatus.COMPLETED:
        return { icon: <CheckCircle />, color: 'success' as const, label: 'Completed' };
      case SimulationStatus.FAILED:
        return { icon: <Error />, color: 'error' as const, label: 'Failed' };
      case SimulationStatus.RUNNING:
        return { icon: <Schedule />, color: 'info' as const, label: 'Running' };
      default:
        return { icon: <Schedule />, color: 'default' as const, label: 'Pending' };
    }
  })();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Simulation Results
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip icon={statusMeta.icon} label={statusMeta.label} color={statusMeta.color} />
            <Typography variant="caption" color="text.secondary">
              Execution time: {executionTimeMs}ms
              {slowExecution && ' (> 5s)'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={onDiscard} disabled={applying}>
            Discard
          </Button>
          <Button variant="contained" color="primary" onClick={onApply} disabled={applying}>
            {applying ? 'Applying...' : 'Apply Simulation'}
          </Button>
        </Box>
      </Box>

      {/* Performance Warning */}
      {slowExecution && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Simulation took longer than expected ({executionTimeMs}ms). Consider optimizing the scenario or reducing the
            schedule size.
          </Typography>
        </Alert>
      )}

      {/* Metrics Comparison */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Metrics Comparison
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              label="Total Tasks"
              valueBefore={metrics.totalTasks}
              valueAfter={metrics.totalTasks}
              icon={<Assignment color="action" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              label="Affected Tasks"
              valueBefore={0}
              valueAfter={metrics.affectedTasks}
              icon={<Schedule color="warning" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              label="Total Delay"
              valueBefore={0}
              valueAfter={metrics.totalDelayHours}
              suffix="h"
              icon={<TrendingUp color="error" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              label="Resource Utilization"
              valueBefore={metrics.resourceUtilizationBefore}
              valueAfter={metrics.resourceUtilizationAfter}
              suffix="%"
              icon={<TrendingDown color="success" />}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Conflicts */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Conflicts Detected</Typography>
          <Chip
            label={`${conflictsDetected} conflict${conflictsDetected === 1 ? '' : 's'}`}
            color={conflictsDetected > 0 ? 'error' : 'success'}
            size="small"
          />
        </Box>

        {conflictsDetected === 0 ? (
          <Alert severity="success">No conflicts detected! The simulation schedule is conflict-free.</Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {conflicts.map((conflict, index) => (
              <ConflictItem key={conflict.id ?? `conflict-${index}`} conflict={conflict} />
            ))}
          </List>
        )}
      </Paper>

      {/* Recommendations */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Recommendations</Typography>
          <Chip
            label={`${recommendations.length} suggestion${recommendations.length === 1 ? '' : 's'}`}
            color="primary"
            size="small"
          />
        </Box>

        {recommendations.length === 0 ? (
          <Alert severity="info">No recommendations available.</Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {recommendations.map((recommendation, index) => (
              <RecommendationItem
                key={recommendation.id ?? `recommendation-${index}`}
                recommendation={recommendation}
              />
            ))}
          </List>
        )}
      </Paper>

      {/* Apply Warning */}
      {conflictsDetected > 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Warning:</strong> Applying this simulation with {conflictsDetected} unresolved conflict
            {conflictsDetected === 1 ? '' : 's'} may cause operational issues. Consider resolving conflicts first or
            adjusting the scenario.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
