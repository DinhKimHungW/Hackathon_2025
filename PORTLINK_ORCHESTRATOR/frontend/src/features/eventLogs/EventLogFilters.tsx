import React from 'react';
import { Box, TextField, MenuItem, Button } from '@mui/material';
import { ClearAll as ClearIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setFilters, resetFilters } from './eventLogsSlice';
import type { EventType, EventSeverity } from './eventLogsSlice';

export const EventLogFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.eventLogs);

  const handleFilterChange = (key: string, value: any) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleDateRangeChange = (key: 'start' | 'end', value: Date | null) => {
    dispatch(
      setFilters({
        dateRange: {
          ...filters.dateRange,
          [key]: value,
        },
      })
    );
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(5, 1fr)',
        },
        gap: 2,
        mb: 2,
      }}
    >
      {/* Search */}
      <TextField
        label="Search"
        placeholder="Search description..."
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        size="small"
      />

      {/* Event Type Filter */}
      <TextField
        select
        label="Event Type"
        value={filters.eventType}
        onChange={(e) => handleFilterChange('eventType', e.target.value as EventType | 'ALL')}
        size="small"
      >
        <MenuItem value="ALL">All Events</MenuItem>
        <MenuItem value="USER_LOGIN">🔓 User Login</MenuItem>
        <MenuItem value="USER_LOGOUT">🔒 User Logout</MenuItem>
        <MenuItem value="ASSET_UPDATE">🔧 Asset Update</MenuItem>
        <MenuItem value="SCHEDULE_CREATE">📅 Schedule Created</MenuItem>
        <MenuItem value="SCHEDULE_UPDATE">📝 Schedule Updated</MenuItem>
        <MenuItem value="TASK_CREATE">✅ Task Created</MenuItem>
        <MenuItem value="TASK_UPDATE">📝 Task Updated</MenuItem>
        <MenuItem value="SIMULATION_START">▶️ Simulation Started</MenuItem>
        <MenuItem value="SIMULATION_COMPLETE">✔️ Simulation Complete</MenuItem>
        <MenuItem value="CONFLICT_DETECTED">⚠️ Conflict Detected</MenuItem>
        <MenuItem value="CONFLICT_RESOLVED">✅ Conflict Resolved</MenuItem>
        <MenuItem value="SYSTEM_ERROR">❌ System Error</MenuItem>
        <MenuItem value="DATA_EXPORT">📤 Data Export</MenuItem>
        <MenuItem value="DATA_IMPORT">📥 Data Import</MenuItem>
      </TextField>

      {/* Severity Filter */}
      <TextField
        select
        label="Severity"
        value={filters.severity}
        onChange={(e) => handleFilterChange('severity', e.target.value as EventSeverity | 'ALL')}
        size="small"
      >
        <MenuItem value="ALL">All Severities</MenuItem>
        <MenuItem value="INFO">ℹ️ Info</MenuItem>
        <MenuItem value="WARNING">⚠️ Warning</MenuItem>
        <MenuItem value="ERROR">❌ Error</MenuItem>
        <MenuItem value="CRITICAL">🔴 Critical</MenuItem>
      </TextField>

      {/* Entity Type Filter */}
      <TextField
        label="Entity Type"
        placeholder="e.g., Asset, Schedule"
        value={filters.entityType || ''}
        onChange={(e) => handleFilterChange('entityType', e.target.value || null)}
        size="small"
      />

      {/* Start Date */}
      <DateTimePicker
        label="Start Date"
        value={filters.dateRange.start}
        onChange={(value) => handleDateRangeChange('start', value)}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
          },
        }}
      />

      {/* End Date */}
      <DateTimePicker
        label="End Date"
        value={filters.dateRange.end}
        onChange={(value) => handleDateRangeChange('end', value)}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
          },
        }}
      />

      {/* Clear Filters Button */}
      <Button
        variant="outlined"
        startIcon={<ClearIcon />}
        onClick={handleReset}
        sx={{ gridColumn: { lg: '5 / 6' } }}
      >
        Clear
      </Button>
    </Box>
  );
};

export default EventLogFilters;
