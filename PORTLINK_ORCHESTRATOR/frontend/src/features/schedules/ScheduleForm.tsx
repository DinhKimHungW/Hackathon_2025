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
  Typography,
  CircularProgress,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createSchedule, updateSchedule } from './schedulesSlice';
import type { Schedule, ScheduleType, ScheduleStatus, RecurrenceType } from './types/index';

// ==================== VALIDATION SCHEMA ====================

const scheduleSchema = yup.object({
  name: yup.string().required('Schedule name is required').min(3, 'Name must be at least 3 characters').max(100),
  description: yup.string().max(500, 'Description must be less than 500 characters'),
  type: yup.string().oneOf(['SHIP_ARRIVAL', 'MAINTENANCE', 'PORT_OPERATION']).required('Type is required'),
  startTime: yup.date().required('Start time is required'),
  endTime: yup
    .date()
    .required('End time is required')
    .min(yup.ref('startTime'), 'End time must be after start time'),
  berthId: yup.string().uuid('Invalid berth ID').nullable(),
  shipVisitId: yup.string().uuid('Invalid ship visit ID').nullable(),
  recurrence: yup.string().oneOf(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']),
  status: yup
    .string()
    .oneOf(['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: yup.string().max(1000, 'Notes must be less than 1000 characters'),
});

type ScheduleFormData = yup.InferType<typeof scheduleSchema>;

// ==================== COMPONENT ====================

interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
  schedule?: Schedule | null;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({ open, onClose, schedule }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.schedules);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(scheduleSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'SHIP_ARRIVAL' as ScheduleType,
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000), // +1 hour
      berthId: null,
      shipVisitId: null,
      recurrence: 'NONE' as RecurrenceType,
      status: 'SCHEDULED' as ScheduleStatus,
      notes: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (schedule) {
      reset({
        name: schedule.name,
        description: schedule.description || '',
        type: schedule.type,
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
        berthId: schedule.berthId,
        shipVisitId: schedule.shipVisitId,
        recurrence: schedule.recurrence,
        status: schedule.status,
        notes: schedule.notes || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        type: 'SHIP_ARRIVAL',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        berthId: null,
        shipVisitId: null,
        recurrence: 'NONE',
        status: 'SCHEDULED',
        notes: '',
      });
    }
  }, [schedule, reset]);

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      if (schedule) {
        // Update existing schedule
        await dispatch(
          updateSchedule({
            id: schedule.id,
            data: {
              name: data.name,
              description: data.description || undefined,
              type: data.type as ScheduleType,
              startTime: data.startTime,
              endTime: data.endTime,
              berthId: data.berthId || undefined,
              shipVisitId: data.shipVisitId || undefined,
              recurrence: data.recurrence as RecurrenceType,
              status: data.status as ScheduleStatus,
              notes: data.notes || undefined,
            },
          })
        ).unwrap();
      } else {
        // Create new schedule
        await dispatch(
          createSchedule({
            name: data.name,
            description: data.description || undefined,
            type: data.type as ScheduleType,
            startTime: data.startTime,
            endTime: data.endTime,
            berthId: data.berthId || undefined,
            shipVisitId: data.shipVisitId || undefined,
            recurrence: data.recurrence as RecurrenceType,
            notes: data.notes || undefined,
          })
        ).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{schedule ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Schedule Name */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Schedule Name *"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                multiline
                rows={2}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />

          {/* Schedule Type */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Schedule Type *"
                fullWidth
                error={!!errors.type}
                helperText={errors.type?.message}
              >
                <MenuItem value="SHIP_ARRIVAL">🚢 Ship Arrival</MenuItem>
                <MenuItem value="MAINTENANCE">🔧 Maintenance</MenuItem>
                <MenuItem value="PORT_OPERATION">⚓ Port Operation</MenuItem>
              </TextField>
            )}
          />

          {/* Start Time */}
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="Start Time *"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startTime,
                    helperText: errors.startTime?.message,
                  },
                }}
              />
            )}
          />

          {/* End Time */}
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="End Time *"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.endTime,
                    helperText: errors.endTime?.message,
                  },
                }}
              />
            )}
          />

          {/* Recurrence */}
          <Controller
            name="recurrence"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Recurrence"
                fullWidth
                error={!!errors.recurrence}
                helperText={errors.recurrence?.message}
              >
                <MenuItem value="NONE">None</MenuItem>
                <MenuItem value="DAILY">Daily</MenuItem>
                <MenuItem value="WEEKLY">Weekly</MenuItem>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
              </TextField>
            )}
          />

          {/* Status (only for editing) */}
          {schedule && (
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  fullWidth
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </TextField>
              )}
            />
          )}

          {/* Notes */}
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Notes"
                fullWidth
                multiline
                rows={3}
                error={!!errors.notes}
                helperText={errors.notes?.message}
              />
            )}
          />

          <Typography variant="caption" color="text.secondary">
            * Required fields
          </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {schedule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ScheduleForm;
