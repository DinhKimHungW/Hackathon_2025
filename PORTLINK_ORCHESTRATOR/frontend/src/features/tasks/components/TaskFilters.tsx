import React, { useState, useCallback } from 'react';
import { Box, Paper, TextField, MenuItem, Button, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Search as SearchIcon, FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setFilters, resetFilters } from '../tasksSlice';
import type { TaskType, TaskStatus, TaskPriority } from '../tasksSlice';

// Simple debounce utility
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ==================== TYPES ====================

const taskTypes: Array<TaskType | 'ALL'> = ['ALL', 'LOADING', 'UNLOADING', 'INSPECTION', 'MAINTENANCE'];
const taskStatuses: Array<TaskStatus | 'ALL'> = ['ALL', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const taskPriorities: Array<TaskPriority | 'ALL'> = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

// ==================== COMPONENT ====================

export const TaskFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.tasks);

  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      dispatch(setFilters({ search: value }));
    }, 500),
    [dispatch]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearch(value);
    debouncedSearch(value);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ type: event.target.value as TaskType | 'ALL' }));
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ status: event.target.value as TaskStatus | 'ALL' }));
  };

  const handlePriorityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ priority: event.target.value as TaskPriority | 'ALL' }));
  };

  const handleStartDateChange = (date: Date | null) => {
    dispatch(
      setFilters({
        dateRange: {
          ...filters.dateRange,
          start: date,
        },
      })
    );
  };

  const handleEndDateChange = (date: Date | null) => {
    dispatch(
      setFilters({
        dateRange: {
          ...filters.dateRange,
          end: date,
        },
      })
    );
  };

  const handleReset = () => {
    setLocalSearch('');
    dispatch(resetFilters());
  };

  const hasActiveFilters =
    filters.search ||
    filters.type !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.assigneeId;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6">Filters</Typography>
        </Box>
        {hasActiveFilters && (
          <Button startIcon={<ClearIcon />} onClick={handleReset} size="small">
            Clear Filters
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: 2,
        }}
      >
        {/* Search */}
        <Box sx={{ gridColumn: { xs: '1', lg: '1 / 3' } }}>
          <TextField
            fullWidth
            size="small"
            label="Search Tasks"
            placeholder="Search by title..."
            value={localSearch}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </Box>

        {/* Task Type */}
        <Box>
          <TextField
            select
            fullWidth
            size="small"
            label="Task Type"
            value={filters.type}
            onChange={handleTypeChange}
          >
            {taskTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Status */}
        <Box>
          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={filters.status}
            onChange={handleStatusChange}
          >
            {taskStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status === 'ALL' ? 'All Statuses' : status.replace('_', ' ')}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Priority */}
        <Box>
          <TextField
            select
            fullWidth
            size="small"
            label="Priority"
            value={filters.priority}
            onChange={handlePriorityChange}
          >
            {taskPriorities.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priority === 'ALL' ? 'All Priorities' : priority}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Start Date */}
        <Box>
          <DatePicker
            label="From Date"
            value={filters.dateRange.start}
            onChange={handleStartDateChange}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
        </Box>

        {/* End Date */}
        <Box>
          <DatePicker
            label="To Date"
            value={filters.dateRange.end}
            onChange={handleEndDateChange}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default TaskFilters;
