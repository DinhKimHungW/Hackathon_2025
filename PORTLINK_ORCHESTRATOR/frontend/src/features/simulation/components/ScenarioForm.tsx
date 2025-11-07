/**
 * ScenarioForm Component
 * Multi-step wizard for creating simulation scenarios
 */

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { PlayArrow, ArrowBack, ArrowForward } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ScenarioType,
  type CreateSimulationDto,
  type SimulationFormData,
  SCENARIO_TYPE_LABELS,
} from '@/types/simulation.types';

// ==================== VALIDATION SCHEMAS ====================

const step1Schema = yup.object({
  name: yup.string().required('Simulation name is required').min(3).max(100),
  scenarioType: yup.string().oneOf(Object.values(ScenarioType)).required(),
});

const shipDelaySchema = yup.object({
  shipDelayConfig: yup.object({
    shipVisitId: yup.string().required('Ship visit is required'),
    delayHours: yup.number().required().min(1).max(48),
    reason: yup.string(),
  }).required(),
});

const assetMaintenanceSchema = yup.object({
  assetMaintenanceConfig: yup.object({
    assetId: yup.string().required('Asset is required'),
    maintenanceStart: yup.string().required('Start time is required'),
    maintenanceDuration: yup.number().required().min(1).max(24),
    notes: yup.string(),
  }).required(),
});

// ==================== COMPONENT ====================

interface ScenarioFormProps {
  onSubmit: (dto: CreateSimulationDto) => void;
  loading: boolean;
  baseScheduleId: string; // From active schedule
  shipVisits?: Array<{ id: string; shipName: string }>; // Available ships
  assets?: Array<{ id: string; name: string; type: string }>; // Available assets
}

export default function ScenarioForm({
  onSubmit,
  loading,
  baseScheduleId,
  shipVisits = [],
  assets = [],
}: ScenarioFormProps) {
  const [activeStep, setActiveStep] = useState(0);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    setError,
    clearErrors,
  } = useForm<SimulationFormData>({
    defaultValues: {
      name: '',
      scenarioType: ScenarioType.SHIP_DELAY,
      shipDelayConfig: {
        shipVisitId: '',
        delayHours: 3,
        reason: '',
      },
      assetMaintenanceConfig: {
        assetId: '',
        maintenanceStart: new Date().toISOString(),
        maintenanceDuration: 2,
        notes: '',
      },
      customChanges: [],
    },
  });

  const scenarioType = watch('scenarioType');

  const steps = ['Select Scenario', 'Configure Details', 'Review & Run'];

  const getValidationSchema = (step = activeStep, type: ScenarioType = scenarioType) => {
    if (step === 0) {
      return step1Schema;
    }

    if (step === 1) {
      if (type === ScenarioType.SHIP_DELAY) {
        return shipDelaySchema.concat(step1Schema);
      }

      if (type === ScenarioType.ASSET_MAINTENANCE) {
        return assetMaintenanceSchema.concat(step1Schema);
      }

      return step1Schema;
    }

    return step1Schema;
  };

  const applyValidationErrors = (validationError: unknown) => {
    if (validationError instanceof yup.ValidationError) {
      clearErrors();
      validationError.inner.forEach((error) => {
        if (error.path) {
          setError(error.path as any, {
            type: 'manual',
            message: error.message,
          });
        }
      });
    }
  };

  const handleNext = async () => {
    try {
      const schema = getValidationSchema();
      await schema.validate(getValues(), { abortEarly: false });
      clearErrors();
      setActiveStep((prev) => prev + 1);
    } catch (error) {
      applyValidationErrors(error);
    }
  };

  const handleBack = () => {
    clearErrors();
    setActiveStep((prev) => prev - 1);
  };

  const onFormSubmit = async (data: SimulationFormData) => {
    try {
      const schema = getValidationSchema(1, data.scenarioType);
      await schema.validate(data, { abortEarly: false });
      clearErrors();
    } catch (error) {
      applyValidationErrors(error);
      return;
    }

    // Transform form data to CreateSimulationDto
    const dto: CreateSimulationDto = {
      name: data.name,
      baseScheduleId,
      scenarioType: data.scenarioType,
      changes: [],
    };

    // Build changes array based on scenario type
    if (data.scenarioType === ScenarioType.SHIP_DELAY && data.shipDelayConfig) {
      dto.changes = [
        {
          entityType: 'ship_visit',
          entityId: data.shipDelayConfig.shipVisitId,
          field: 'etaActual',
          oldValue: '0',
          newValue: data.shipDelayConfig.delayHours,
        },
      ];
    } else if (data.scenarioType === ScenarioType.ASSET_MAINTENANCE && data.assetMaintenanceConfig) {
      dto.changes = [
        {
          entityType: 'asset',
          entityId: data.assetMaintenanceConfig.assetId,
          field: 'maintenanceWindow',
          oldValue: null,
          newValue: {
            maintenanceStart: data.assetMaintenanceConfig.maintenanceStart,
            maintenanceDuration: data.assetMaintenanceConfig.maintenanceDuration,
          },
        },
      ];
    } else if (data.customChanges) {
      dto.changes = data.customChanges;
    }

    onSubmit(dto);
  };

  // ==================== STEP CONTENT ====================

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Simulation Name */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Simulation Name *"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  placeholder="e.g., Ship A Delay 3 Hours"
                />
              )}
            />

            {/* Scenario Type */}
            <FormControl component="fieldset">
              <FormLabel component="legend">Scenario Type *</FormLabel>
              <Controller
                name="scenarioType"
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field}>
                    <FormControlLabel
                      value={ScenarioType.SHIP_DELAY}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle2">Ship Delay</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Simulate a ship arrival delay and its impact on schedule
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value={ScenarioType.ASSET_MAINTENANCE}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle2">Asset Maintenance</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Schedule maintenance window for berth or crane
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value={ScenarioType.CUSTOM}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle2">Custom Scenario</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Advanced: Define custom changes to tasks or assets
                          </Typography>
                        </Box>
                      }
                      disabled
                    />
                  </RadioGroup>
                )}
              />
            </FormControl>
          </Box>
        );

      case 1:
        if (scenarioType === ScenarioType.SHIP_DELAY) {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6">Ship Delay Configuration</Typography>

              {/* Ship Selection */}
              <Controller
                name="shipDelayConfig.shipVisitId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Select Ship *"
                    fullWidth
                    error={!!errors.shipDelayConfig?.shipVisitId}
                    helperText={errors.shipDelayConfig?.shipVisitId?.message}
                  >
                    {shipVisits.length === 0 && (
                      <MenuItem disabled value="">
                        No ship visits available
                      </MenuItem>
                    )}
                    {shipVisits.map((ship) => (
                      <MenuItem key={ship.id} value={ship.id}>
                        {ship.shipName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              {/* Delay Hours */}
              <Controller
                name="shipDelayConfig.delayHours"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Delay (hours) *"
                    fullWidth
                    inputProps={{ min: 1, max: 48, step: 0.5 }}
                    error={!!errors.shipDelayConfig?.delayHours}
                    helperText={errors.shipDelayConfig?.delayHours?.message || 'Range: 1-48 hours'}
                  />
                )}
              />

              {/* Reason */}
              <Controller
                name="shipDelayConfig.reason"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Reason (optional)"
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="e.g., Bad weather, technical issue"
                  />
                )}
              />
            </Box>
          );
        } else if (scenarioType === ScenarioType.ASSET_MAINTENANCE) {
          return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h6">Asset Maintenance Configuration</Typography>

                {/* Asset Selection */}
                <Controller
                  name="assetMaintenanceConfig.assetId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Select Asset *"
                      fullWidth
                      error={!!errors.assetMaintenanceConfig?.assetId}
                      helperText={errors.assetMaintenanceConfig?.assetId?.message}
                    >
                      {assets.length === 0 && (
                        <MenuItem disabled value="">
                          No assets available
                        </MenuItem>
                      )}
                      {assets.map((asset) => (
                        <MenuItem key={asset.id} value={asset.id}>
                          {asset.name} ({asset.type})
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* Maintenance Start Time */}
                <Controller
                  name="assetMaintenanceConfig.maintenanceStart"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      label="Maintenance Start *"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date?.toISOString())}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.assetMaintenanceConfig?.maintenanceStart,
                          helperText: errors.assetMaintenanceConfig?.maintenanceStart?.message,
                        },
                      }}
                    />
                  )}
                />

                {/* Maintenance Duration */}
                <Controller
                  name="assetMaintenanceConfig.maintenanceDuration"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Duration (hours) *"
                      fullWidth
                      inputProps={{ min: 1, max: 24, step: 0.5 }}
                      error={!!errors.assetMaintenanceConfig?.maintenanceDuration}
                      helperText={
                        errors.assetMaintenanceConfig?.maintenanceDuration?.message || 'Range: 1-24 hours'
                      }
                    />
                  )}
                />

                {/* Notes */}
                <Controller
                  name="assetMaintenanceConfig.notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes (optional)"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="e.g., Scheduled maintenance, repair work"
                    />
                  )}
                />
              </Box>
            </LocalizationProvider>
          );
        } else {
          return (
            <Alert severity="info">
              Custom scenario configuration is coming soon. Please select Ship Delay or Asset Maintenance.
            </Alert>
          );
        }

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Review Simulation</Typography>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Simulation Name
              </Typography>
              <Typography variant="body1" gutterBottom>
                {watch('name')}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                Scenario Type
              </Typography>
              <Typography variant="body1" gutterBottom>
                {SCENARIO_TYPE_LABELS[scenarioType]}
              </Typography>

              {scenarioType === ScenarioType.SHIP_DELAY && watch('shipDelayConfig') && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Configuration
                  </Typography>
                  <Typography variant="body2">
                    • Ship: {shipVisits.find((s) => s.id === watch('shipDelayConfig.shipVisitId'))?.shipName}
                  </Typography>
                  <Typography variant="body2">• Delay: {watch('shipDelayConfig.delayHours')} hours</Typography>
                  {watch('shipDelayConfig.reason') && (
                    <Typography variant="body2">• Reason: {watch('shipDelayConfig.reason')}</Typography>
                  )}
                </>
              )}

              {scenarioType === ScenarioType.ASSET_MAINTENANCE && watch('assetMaintenanceConfig') && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Configuration
                  </Typography>
                  <Typography variant="body2">
                    • Asset: {assets.find((a) => a.id === watch('assetMaintenanceConfig.assetId'))?.name}
                  </Typography>
                  <Typography variant="body2">
                    • Start: {new Date(watch('assetMaintenanceConfig.maintenanceStart') || '').toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    • Duration: {watch('assetMaintenanceConfig.maintenanceDuration')} hours
                  </Typography>
                </>
              )}
            </Paper>

            <Alert severity="warning">
              This simulation will create a copy of the active schedule and apply the scenario changes. The
              original schedule will not be modified.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  // ==================== RENDER ====================

  return (
    <Box sx={{ width: '100%' }}>
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ minHeight: 300, mb: 3 }}>{renderStepContent(activeStep)}</Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0 || loading} onClick={handleBack} startIcon={<ArrowBack />}>
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext} endIcon={<ArrowForward />} disabled={loading}>
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit(onFormSubmit)}
              startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
              disabled={loading}
            >
              {loading ? 'Running...' : 'Run Simulation'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
