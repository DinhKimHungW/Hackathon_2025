import React from 'react';
import { Box, TextField, MenuItem, Button, Checkbox, FormControlLabel } from '@mui/material';
import { ClearAll as ClearIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setFilters, resetFilters } from './assetsSlice';
import type { AssetType, AssetStatus } from './assetsSlice';

export const AssetFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.assets);

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
        placeholder="Asset code or name"
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        size="small"
      />

      {/* Type Filter */}
      <TextField
        select
        label="Type"
        value={filters.type}
        onChange={(e) => handleFilterChange('type', e.target.value as AssetType | 'ALL')}
        size="small"
      >
        <MenuItem value="ALL">All Types</MenuItem>
        <MenuItem value="CRANE">🏗️ Crane</MenuItem>
        <MenuItem value="TRUCK">🚛 Truck</MenuItem>
        <MenuItem value="REACH_STACKER">🏋️ Reach Stacker</MenuItem>
        <MenuItem value="FORKLIFT">🏴 Forklift</MenuItem>
        <MenuItem value="YARD_TRACTOR">🚜 Yard Tractor</MenuItem>
        <MenuItem value="OTHER">🔧 Other</MenuItem>
      </TextField>

      {/* Status Filter */}
      <TextField
        select
        label="Status"
        value={filters.status}
        onChange={(e) => handleFilterChange('status', e.target.value as AssetStatus | 'ALL')}
        size="small"
      >
        <MenuItem value="ALL">All Status</MenuItem>
        <MenuItem value="AVAILABLE">Available</MenuItem>
        <MenuItem value="IN_USE">In Use</MenuItem>
        <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
        <MenuItem value="OFFLINE">Offline</MenuItem>
      </TextField>

      {/* Location Filter */}
      <TextField
        label="Location"
        placeholder="Filter by location"
        value={filters.location || ''}
        onChange={(e) => handleFilterChange('location', e.target.value || null)}
        size="small"
      />

      {/* Maintenance Due Checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            checked={filters.maintenanceDue}
            onChange={(e) => handleFilterChange('maintenanceDue', e.target.checked)}
          />
        }
        label="Maintenance Due"
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

export default AssetFilters;
