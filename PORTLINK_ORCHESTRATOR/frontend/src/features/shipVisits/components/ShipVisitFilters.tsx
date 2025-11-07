import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  InputAdornment,
  Chip,
  Typography,
  IconButton,
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import type { ShipVisitsFilters, ShipVisitStatus } from '../shipVisitsSlice';

interface ShipVisitFiltersProps {
  filters: ShipVisitsFilters;
  onFilterChange: (filters: Partial<ShipVisitsFilters>) => void;
}

const statusOptions: Array<{ value: ShipVisitStatus | 'ALL'; label: string; color: string }> = [
  { value: 'ALL', label: 'All Status', color: '#757575' },
  { value: 'PLANNED', label: 'Planned', color: '#1976d2' },
  { value: 'ARRIVED', label: 'Arrived', color: '#2e7d32' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#ed6c02' },
  { value: 'COMPLETED', label: 'Completed', color: '#9c27b0' },
  { value: 'DEPARTED', label: 'Departed', color: '#607d8b' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#d32f2f' },
];

export default function ShipVisitFilters({ filters, onFilterChange }: ShipVisitFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  const handleStatusChange = (status: ShipVisitStatus | 'ALL') => {
    onFilterChange({ status });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onFilterChange({ search: '' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    onFilterChange({
      status: 'ALL',
      search: '',
      dateRange: { start: null, end: null },
      portId: 'ALL',
    });
  };

  const hasActiveFilters = 
    filters.status !== 'ALL' || 
    filters.search !== '' || 
    filters.dateRange.start !== null || 
    filters.dateRange.end !== null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      {/* Filter Icon & Label */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          gap: 1,
          minWidth: 120,
        }}
      >
        <FilterList color="action" />
        <Typography variant="subtitle2" color="text.secondary">
          Filters:
        </Typography>
      </Box>

      {/* Status Filter */}
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status}
          label="Status"
          onChange={(e) => handleStatusChange(e.target.value as ShipVisitStatus | 'ALL')}
          renderValue={(value) => {
            const option = statusOptions.find(o => o.value === value);
            return (
              <Chip
                label={option?.label}
                size="small"
                sx={{
                  bgcolor: option?.color + '20',
                  color: option?.color,
                  fontWeight: 600,
                  height: 24,
                }}
              />
            );
          }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Chip
                label={option.label}
                size="small"
                sx={{
                  bgcolor: option.color + '20',
                  color: option.color,
                  fontWeight: 600,
                }}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Search Input */}
      <TextField
        size="small"
        placeholder="Search by ship name, IMO, vessel type..."
        value={searchInput}
        onChange={handleSearchChange}
        sx={{ flex: 1, minWidth: 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchInput && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClearSearch}>
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="outlined"
          size="small"
          onClick={handleResetFilters}
          startIcon={<Clear />}
          sx={{ minWidth: 100 }}
        >
          Reset
        </Button>
      )}
    </Box>
  );
}
