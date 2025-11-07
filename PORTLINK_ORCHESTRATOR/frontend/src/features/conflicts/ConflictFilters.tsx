import React from 'react';
import { Box, TextField, MenuItem, Button, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { ClearAll as ClearIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setFilters, resetFilters } from './conflictsSlice';
import type { ConflictType, ConflictSeverity } from './conflictsSlice';

export const ConflictFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.conflicts);

  const handleFilterChange = (key: string, value: any) => {
    dispatch(setFilters({ [key]: value }));
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
          md: 'repeat(4, 1fr)',
        },
        gap: 2,
        mb: 2,
      }}
    >
      {/* Search */}
      <TextField
        label="Search"
        placeholder="Search conflicts..."
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        size="small"
      />

      {/* Conflict Type Filter */}
      <TextField
        select
        label="Conflict Type"
        value={filters.conflictType}
        onChange={(e) => handleFilterChange('conflictType', e.target.value as ConflictType | 'ALL')}
        size="small"
      >
        <MenuItem value="ALL">All Types</MenuItem>
        <MenuItem value="RESOURCE_OVERLAP">🔧 Resource Overlap</MenuItem>
        <MenuItem value="TIME_OVERLAP">⏰ Time Overlap</MenuItem>
        <MenuItem value="LOCATION_OVERLAP">📍 Location Overlap</MenuItem>
        <MenuItem value="CAPACITY_EXCEEDED">📊 Capacity Exceeded</MenuItem>
      </TextField>

      {/* Severity Filter */}
      <TextField
        select
        label="Severity"
        value={filters.severity}
        onChange={(e) => handleFilterChange('severity', e.target.value as ConflictSeverity | 'ALL')}
        size="small"
      >
        <MenuItem value="ALL">All Severities</MenuItem>
        <MenuItem value="LOW">🔵 Low</MenuItem>
        <MenuItem value="MEDIUM">🟡 Medium</MenuItem>
        <MenuItem value="HIGH">🟠 High</MenuItem>
        <MenuItem value="CRITICAL">🔴 Critical</MenuItem>
      </TextField>

      {/* Status Filter */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <RadioGroup
          row
          value={filters.resolved}
          onChange={(e) => handleFilterChange('resolved', e.target.value)}
        >
          <FormControlLabel value="ALL" control={<Radio size="small" />} label="All" />
          <FormControlLabel value="UNRESOLVED" control={<Radio size="small" />} label="Unresolved" />
          <FormControlLabel value="RESOLVED" control={<Radio size="small" />} label="Resolved" />
        </RadioGroup>
      </Box>

      {/* Clear Filters Button */}
      <Button
        variant="outlined"
        startIcon={<ClearIcon />}
        onClick={handleReset}
        sx={{ gridColumn: { md: '4 / 5' } }}
      >
        Clear
      </Button>
    </Box>
  );
};

export default ConflictFilters;
