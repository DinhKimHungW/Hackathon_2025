import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createAsset, updateAsset } from './assetsSlice';
import type { Asset, AssetType, AssetStatus } from './assetsSlice';

// ==================== VALIDATION SCHEMA ====================

const assetSchema = yup.object({
  assetCode: yup.string().required('Asset code is required').min(2, 'Asset code must be at least 2 characters').max(50),
  name: yup.string().required('Name is required').min(3, 'Name must be at least 3 characters').max(255),
  type: yup.string().oneOf(['CRANE', 'TRUCK', 'REACH_STACKER', 'FORKLIFT', 'YARD_TRACTOR', 'OTHER']).required('Type is required'),
  status: yup.string().oneOf(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OFFLINE']),
  capacity: yup.number().positive('Capacity must be positive').nullable(),
  capacityUnit: yup.string().max(50).nullable(),
  location: yup.string().max(255).nullable(),
  specifications: yup.object().nullable(),
  lastMaintenanceDate: yup.date().nullable(),
  nextMaintenanceDate: yup.date().nullable(),
  notes: yup.string().max(1000, 'Notes must be less than 1000 characters').nullable(),
});

// ==================== COMPONENT ====================

interface AssetFormProps {
  open: boolean;
  onClose: () => void;
  asset?: Asset | null;
}

export const AssetForm: React.FC<AssetFormProps> = ({ open, onClose, asset }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.assets);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(assetSchema),
    defaultValues: {
      assetCode: '',
      name: '',
      type: 'CRANE' as AssetType,
      status: 'AVAILABLE' as AssetStatus,
      capacity: null,
      capacityUnit: 'tons',
      location: '',
      specifications: null,
      lastMaintenanceDate: null,
      nextMaintenanceDate: null,
      notes: '',
    },
  });

  useEffect(() => {
    if (asset) {
      reset({
        assetCode: asset.assetCode,
        name: asset.name,
        type: asset.type,
        status: asset.status,
        capacity: asset.capacity,
        capacityUnit: asset.capacityUnit || 'tons',
        location: asset.location || '',
        specifications: asset.specifications,
        lastMaintenanceDate: asset.lastMaintenanceDate ? new Date(asset.lastMaintenanceDate) : null,
        nextMaintenanceDate: asset.nextMaintenanceDate ? new Date(asset.nextMaintenanceDate) : null,
        notes: asset.notes || '',
      });
    } else {
      reset({
        assetCode: '',
        name: '',
        type: 'CRANE',
        status: 'AVAILABLE',
        capacity: null,
        capacityUnit: 'tons',
        location: '',
        specifications: null,
        lastMaintenanceDate: null,
        nextMaintenanceDate: null,
        notes: '',
      });
    }
  }, [asset, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (asset) {
        await dispatch(updateAsset({ assetId: asset.id, data })).unwrap();
      } else {
        await dispatch(createAsset(data)).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save asset:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{asset ? 'Edit Asset' : 'Create New Asset'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
          {/* Asset Code */}
          <Controller
            name="assetCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Asset Code"
                required
                error={!!errors.assetCode}
                helperText={errors.assetCode?.message}
                disabled={!!asset} // Cannot change asset code after creation
              />
            )}
          />

          {/* Name */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                required
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          {/* Type */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Type"
                required
                error={!!errors.type}
                helperText={errors.type?.message}
              >
                <MenuItem value="CRANE">🏗️ Crane</MenuItem>
                <MenuItem value="TRUCK">🚛 Truck</MenuItem>
                <MenuItem value="REACH_STACKER">🏋️ Reach Stacker</MenuItem>
                <MenuItem value="FORKLIFT">🏴 Forklift</MenuItem>
                <MenuItem value="YARD_TRACTOR">🚜 Yard Tractor</MenuItem>
                <MenuItem value="OTHER">🔧 Other</MenuItem>
              </TextField>
            )}
          />

          {/* Status (only show when editing) */}
          {asset && (
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  <MenuItem value="AVAILABLE">Available</MenuItem>
                  <MenuItem value="IN_USE">In Use</MenuItem>
                  <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                  <MenuItem value="OFFLINE">Offline</MenuItem>
                </TextField>
              )}
            />
          )}

          {/* Capacity */}
          <Controller
            name="capacity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Capacity"
                type="number"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                error={!!errors.capacity}
                helperText={errors.capacity?.message}
                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              />
            )}
          />

          {/* Capacity Unit */}
          <Controller
            name="capacityUnit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Capacity Unit"
                placeholder="e.g., tons, kg, m³"
                value={field.value || ''}
                error={!!errors.capacityUnit}
                helperText={errors.capacityUnit?.message}
              />
            )}
          />

          {/* Location */}
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Location"
                placeholder="e.g., Berth 1, Yard A"
                value={field.value || ''}
                error={!!errors.location}
                helperText={errors.location?.message}
              />
            )}
          />

          {/* Last Maintenance Date */}
          <Controller
            name="lastMaintenanceDate"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="Last Maintenance Date"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    error: !!errors.lastMaintenanceDate,
                    helperText: errors.lastMaintenanceDate?.message,
                  },
                }}
              />
            )}
          />

          {/* Next Maintenance Date */}
          <Controller
            name="nextMaintenanceDate"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="Next Maintenance Date"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    error: !!errors.nextMaintenanceDate,
                    helperText: errors.nextMaintenanceDate?.message,
                  },
                }}
              />
            )}
          />

          {/* Notes - Full width */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes"
                  multiline
                  rows={3}
                  fullWidth
                  value={field.value || ''}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                />
              )}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {asset ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetForm;
