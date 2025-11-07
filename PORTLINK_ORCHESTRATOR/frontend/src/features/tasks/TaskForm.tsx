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
  Autocomplete,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createTask, updateTask } from './tasksSlice';
import type { Task, TaskType, TaskPriority, TaskStatus } from './tasksSlice';

// ==================== VALIDATION SCHEMA ====================

const taskSchema = yup.object({
  title: yup.string().required('Task title is required').min(3, 'Title must be at least 3 characters').max(100),
  description: yup.string().max(500, 'Description must be less than 500 characters'),
  type: yup.string().oneOf(['LOADING', 'UNLOADING', 'INSPECTION', 'MAINTENANCE']).required('Type is required'),
  priority: yup.string().oneOf(['HIGH', 'MEDIUM', 'LOW']).required('Priority is required'),
  status: yup.string().oneOf(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  assigneeId: yup.string().uuid('Invalid assignee ID').nullable(),
  dueDate: yup.date().min(new Date(), 'Due date must be in the future').nullable(),
  estimatedHours: yup.number().positive('Estimated hours must be positive').max(999, 'Maximum 999 hours').nullable(),
  actualHours: yup.number().positive('Actual hours must be positive').max(999, 'Maximum 999 hours').nullable(),
  scheduleId: yup.string().uuid('Invalid schedule ID').nullable(),
  shipVisitId: yup.string().uuid('Invalid ship visit ID').nullable(),
});

type TaskFormData = yup.InferType<typeof taskSchema>;

// ==================== MOCK DATA (Replace with API calls) ====================

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@portlink.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@portlink.com' },
  { id: '3', name: 'Mike Johnson', email: 'mike@portlink.com' },
];

const mockSchedules = [
  { id: '1', name: 'Container Ship Arrival - MSC Diana' },
  { id: '2', name: 'Maintenance - Crane #3' },
  { id: '3', name: 'Port Operation - Berth Cleaning' },
];

const mockShipVisits = [
  { id: '1', vesselName: 'MSC Diana', imoNumber: 'IMO9234567' },
  { id: '2', vesselName: 'Maersk Alabama', imoNumber: 'IMO9234568' },
  { id: '3', vesselName: 'COSCO Shipping', imoNumber: 'IMO9234569' },
];

// ==================== COMPONENT ====================

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
}

export const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, task }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.tasks);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'LOADING' as TaskType,
      priority: 'MEDIUM' as TaskPriority,
      status: 'TODO' as TaskStatus,
      assigneeId: null,
      dueDate: null,
      estimatedHours: null,
      actualHours: null,
      scheduleId: null,
      shipVisitId: null,
    },
  });

  const watchStatus = watch('status');

  // Populate form when editing
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        type: task.type,
        priority: task.priority,
        status: task.status,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        scheduleId: task.scheduleId,
        shipVisitId: task.shipVisitId,
      });
    } else {
      reset({
        title: '',
        description: '',
        type: 'LOADING',
        priority: 'MEDIUM',
        status: 'TODO',
        assigneeId: null,
        dueDate: null,
        estimatedHours: null,
        actualHours: null,
        scheduleId: null,
        shipVisitId: null,
      });
    }
  }, [task, reset]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (task) {
        // Update existing task
        await dispatch(
          updateTask({
            id: task.id,
            data: {
              title: data.title,
              description: data.description || undefined,
              type: data.type as TaskType,
              priority: data.priority as TaskPriority,
              status: data.status as TaskStatus,
              assigneeId: data.assigneeId || undefined,
              dueDate: data.dueDate || undefined,
              estimatedHours: data.estimatedHours || undefined,
              actualHours: data.actualHours || undefined,
              scheduleId: data.scheduleId || undefined,
              shipVisitId: data.shipVisitId || undefined,
            },
          })
        ).unwrap();
      } else {
        // Create new task
        await dispatch(
          createTask({
            title: data.title,
            description: data.description || undefined,
            type: data.type as TaskType,
            priority: data.priority as TaskPriority,
            assigneeId: data.assigneeId || undefined,
            dueDate: data.dueDate || undefined,
            estimatedHours: data.estimatedHours || undefined,
            scheduleId: data.scheduleId || undefined,
            shipVisitId: data.shipVisitId || undefined,
          })
        ).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Task Title */}
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Task Title *"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
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
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                placeholder="Describe the task details..."
              />
            )}
          />

          {/* Task Type and Priority */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Task Type *"
                  fullWidth
                  error={!!errors.type}
                  helperText={errors.type?.message}
                >
                  <MenuItem value="LOADING">📦 Loading</MenuItem>
                  <MenuItem value="UNLOADING">🚛 Unloading</MenuItem>
                  <MenuItem value="INSPECTION">🔍 Inspection</MenuItem>
                  <MenuItem value="MAINTENANCE">🔧 Maintenance</MenuItem>
                </TextField>
              )}
            />

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Priority *"
                  fullWidth
                  error={!!errors.priority}
                  helperText={errors.priority?.message}
                >
                  <MenuItem value="HIGH">🔴 High</MenuItem>
                  <MenuItem value="MEDIUM">🟡 Medium</MenuItem>
                  <MenuItem value="LOW">🟢 Low</MenuItem>
                </TextField>
              )}
            />
          </Box>

          {/* Status (only when editing) */}
          {task && (
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
                  <MenuItem value="TODO">To Do</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="REVIEW">Review</MenuItem>
                  <MenuItem value="DONE">Done</MenuItem>
                </TextField>
              )}
            />
          )}

          {/* Assignee */}
          <Controller
            name="assigneeId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={mockUsers}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={mockUsers.find((u) => u.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign To"
                    error={!!errors.assigneeId}
                    helperText={errors.assigneeId?.message}
                  />
                )}
              />
            )}
          />

          {/* Due Date */}
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="Due Date"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.dueDate,
                    helperText: errors.dueDate?.message,
                  },
                }}
              />
            )}
          />

          {/* Estimated and Actual Hours */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Controller
              name="estimatedHours"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Estimated Hours"
                  type="number"
                  fullWidth
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  error={!!errors.estimatedHours}
                  helperText={errors.estimatedHours?.message}
                  InputProps={{ inputProps: { min: 0, max: 999, step: 0.5 } }}
                />
              )}
            />

            <Controller
              name="actualHours"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Actual Hours"
                  type="number"
                  fullWidth
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  error={!!errors.actualHours}
                  helperText={errors.actualHours?.message}
                  InputProps={{ inputProps: { min: 0, max: 999, step: 0.5 } }}
                  disabled={watchStatus !== 'DONE'}
                />
              )}
            />
          </Box>

          {/* Related Schedule */}
          <Controller
            name="scheduleId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={mockSchedules}
                getOptionLabel={(option) => option.name}
                value={mockSchedules.find((s) => s.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Related Schedule"
                    error={!!errors.scheduleId}
                    helperText={errors.scheduleId?.message}
                  />
                )}
              />
            )}
          />

          {/* Related Ship Visit */}
          <Controller
            name="shipVisitId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={mockShipVisits}
                getOptionLabel={(option) => `${option.vesselName} (${option.imoNumber})`}
                value={mockShipVisits.find((sv) => sv.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Related Ship Visit"
                    error={!!errors.shipVisitId}
                    helperText={errors.shipVisitId?.message}
                  />
                )}
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
          {task ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;
