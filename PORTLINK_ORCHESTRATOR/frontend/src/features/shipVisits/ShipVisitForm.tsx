import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Cancel,
  DirectionsBoat,
  CalendarToday,
  LocalShipping,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchShipVisitById,
  createShipVisit,
  updateShipVisit,
  clearCurrentShipVisit,
  type ShipVisitStatus,
} from './shipVisitsSlice';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const shipVisitSchema = yup.object().shape({
  shipName: yup.string().required('Ship name is required'),
  imoNumber: yup
    .string()
    .required('IMO number is required')
    .matches(/^\d{7}$/, 'IMO must be exactly 7 digits'),
  vesselType: yup.string().required('Vessel type is required'),
  flag: yup.string().required('Flag is required'),
  grossTonnage: yup
    .number()
    .typeError('Gross tonnage must be a number')
    .positive('Gross tonnage must be positive')
    .required('Gross tonnage is required'),
  visitPurpose: yup.string().required('Visit purpose is required'),
  eta: yup.date().required('ETA is required').nullable(),
  etd: yup
    .date()
    .required('ETD is required')
    .nullable()
    .min(yup.ref('eta'), 'ETD must be after ETA'),
  status: yup.string().required('Status is required') as yup.Schema<ShipVisitStatus>,
  cargoType: yup.string().defined(),
  cargoQuantity: yup.number().typeError('Cargo quantity must be a number').positive().nullable().defined(),
  cargoUnit: yup.string().defined(),
  specialNotes: yup.string().defined(),
  agentCompany: yup.string().defined(),
  agentContact: yup.string().defined(),
});

interface ShipVisitFormData {
  shipName: string;
  imoNumber: string;
  vesselType: string;
  flag: string;
  grossTonnage: number;
  visitPurpose: string;
  eta: Date | null;
  etd: Date | null;
  status: ShipVisitStatus;
  cargoType: string;
  cargoQuantity: number | null;
  cargoUnit: string;
  specialNotes: string;
  agentCompany: string;
  agentContact: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VESSEL_TYPES = [
  'Container Ship',
  'Bulk Carrier',
  'Tanker',
  'General Cargo',
  'Ro-Ro',
  'Passenger Ship',
  'Fishing Vessel',
  'Other',
];

const VISIT_PURPOSES = [
  'Loading',
  'Unloading',
  'Loading/Unloading',
  'Bunkering',
  'Repair',
  'Crew Change',
  'Transit',
  'Other',
];

const STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ARRIVED', label: 'Arrived' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DEPARTED', label: 'Departed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const CARGO_TYPES = [
  'Container',
  'Bulk Cargo',
  'Liquid Bulk',
  'General Cargo',
  'Refrigerated',
  'Hazardous',
  'Vehicles',
  'Livestock',
  'Other',
];

const CARGO_UNITS = ['Tons', 'TEU', 'Cubic Meters', 'Units', 'Barrels', 'Kilograms'];

// ============================================================================
// COMPONENT
// ============================================================================

const ShipVisitForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isEditMode = Boolean(id);

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { currentShipVisit, loading, error } = useAppSelector(
    (state) => state.shipVisits
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ShipVisitFormData>({
    resolver: yupResolver(shipVisitSchema),
    defaultValues: {
      shipName: '',
      imoNumber: '',
      vesselType: '',
      flag: '',
      grossTonnage: 0,
      visitPurpose: '',
      eta: null,
      etd: null,
      status: 'PLANNED',
      cargoType: '',
      cargoQuantity: null,
      cargoUnit: 'Tons',
      specialNotes: '',
      agentCompany: '',
      agentContact: '',
    },
  });

  // Load existing ship visit data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchShipVisitById(id));
    }

    return () => {
      dispatch(clearCurrentShipVisit());
    };
  }, [dispatch, id, isEditMode]);

  // Populate form with existing data
  useEffect(() => {
    if (isEditMode && currentShipVisit) {
      reset({
        shipName: currentShipVisit.shipName,
        imoNumber: currentShipVisit.imoNumber,
        vesselType: currentShipVisit.vesselType,
        flag: currentShipVisit.flag,
        grossTonnage: currentShipVisit.grossTonnage,
        visitPurpose: currentShipVisit.visitPurpose,
        eta: currentShipVisit.eta ? new Date(currentShipVisit.eta) : null,
        etd: currentShipVisit.etd ? new Date(currentShipVisit.etd) : null,
        status: currentShipVisit.status,
        cargoType: currentShipVisit.cargoType || '',
        cargoQuantity: currentShipVisit.cargoQuantity || null,
        cargoUnit: currentShipVisit.cargoUnit || 'Tons',
        specialNotes: currentShipVisit.specialNotes || '',
        agentCompany: currentShipVisit.agentCompany || '',
        agentContact: currentShipVisit.agentContact || '',
      });
    }
  }, [isEditMode, currentShipVisit, reset]);

  // Track unsaved changes
  useEffect(() => {
    setUnsavedChanges(isDirty);
  }, [isDirty]);

  const onSubmit = async (data: ShipVisitFormData) => {
    try {
      const formattedData = {
        ...data,
        eta: data.eta ? data.eta.toISOString() : '',
        etd: data.etd ? data.etd.toISOString() : '',
        status: data.status as ShipVisitStatus,
        cargoQuantity: data.cargoQuantity ?? undefined,
      };

      if (isEditMode && currentShipVisit) {
        await dispatch(updateShipVisit({ id: currentShipVisit.id, data: formattedData as any }));
      } else {
        await dispatch(createShipVisit(formattedData as any));
      }

      navigate('/ship-visits');
    } catch (err) {
      console.error('Failed to save ship visit:', err);
    }
  };

  const handleBack = () => {
    if (unsavedChanges) {
      setCancelDialogOpen(true);
    } else {
      navigate('/ship-visits');
    }
  };

  const handleCancelConfirm = () => {
    setCancelDialogOpen(false);
    navigate('/ship-visits');
  };

  const handleCancelDialog = () => {
    setCancelDialogOpen(false);
  };

  if (loading && isEditMode) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">
            {isEditMode ? 'Edit Ship Visit' : 'New Ship Visit'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Ship Information Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <DirectionsBoat />
                Ship Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2,
                }}
              >
                <Controller
                  name="shipName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ship Name"
                      required
                      error={!!errors.shipName}
                      helperText={errors.shipName?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="imoNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="IMO Number"
                      required
                      placeholder="1234567"
                      error={!!errors.imoNumber}
                      helperText={errors.imoNumber?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="vesselType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Vessel Type"
                      required
                      error={!!errors.vesselType}
                      helperText={errors.vesselType?.message}
                      fullWidth
                    >
                      {VESSEL_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="flag"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Flag"
                      required
                      placeholder="e.g., Panama, Liberia"
                      error={!!errors.flag}
                      helperText={errors.flag?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="grossTonnage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Gross Tonnage"
                      type="number"
                      required
                      error={!!errors.grossTonnage}
                      helperText={errors.grossTonnage?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="agentCompany"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Agent Company"
                      error={!!errors.agentCompany}
                      helperText={errors.agentCompany?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="agentContact"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Agent Contact"
                      placeholder="Email or Phone"
                      error={!!errors.agentContact}
                      helperText={errors.agentContact?.message}
                      fullWidth
                    />
                  )}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Visit Details Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <CalendarToday />
                Visit Details
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2,
                }}
              >
                <Controller
                  name="visitPurpose"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Visit Purpose"
                      required
                      error={!!errors.visitPurpose}
                      helperText={errors.visitPurpose?.message}
                      fullWidth
                    >
                      {VISIT_PURPOSES.map((purpose) => (
                        <MenuItem key={purpose} value={purpose}>
                          {purpose}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Status"
                      required
                      error={!!errors.status}
                      helperText={errors.status?.message}
                      fullWidth
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="eta"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="ETA (Estimated Time of Arrival)"
                      slotProps={{
                        textField: {
                          required: true,
                          error: !!errors.eta,
                          helperText: errors.eta?.message,
                          fullWidth: true,
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="etd"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="ETD (Estimated Time of Departure)"
                      slotProps={{
                        textField: {
                          required: true,
                          error: !!errors.etd,
                          helperText: errors.etd?.message,
                          fullWidth: true,
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Cargo Information Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <LocalShipping />
                Cargo Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2,
                }}
              >
                <Controller
                  name="cargoType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Cargo Type"
                      error={!!errors.cargoType}
                      helperText={errors.cargoType?.message}
                      fullWidth
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {CARGO_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="cargoUnit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Cargo Unit"
                      error={!!errors.cargoUnit}
                      helperText={errors.cargoUnit?.message}
                      fullWidth
                    >
                      {CARGO_UNITS.map((unit) => (
                        <MenuItem key={unit} value={unit}>
                          {unit}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="cargoQuantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value || ''}
                      label="Cargo Quantity"
                      type="number"
                      error={!!errors.cargoQuantity}
                      helperText={errors.cargoQuantity?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="specialNotes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Special Notes"
                      multiline
                      rows={3}
                      error={!!errors.specialNotes}
                      helperText={errors.specialNotes?.message}
                      fullWidth
                      sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
                    />
                  )}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleBack}
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading}
              size="large"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </Button>
          </Box>
        </form>

        {/* Unsaved Changes Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={handleCancelDialog}
          aria-labelledby="cancel-dialog-title"
        >
          <DialogTitle id="cancel-dialog-title">Unsaved Changes</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You have unsaved changes. Are you sure you want to leave without saving?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDialog}>Stay</Button>
            <Button onClick={handleCancelConfirm} color="error" variant="contained">
              Leave
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ShipVisitForm;
