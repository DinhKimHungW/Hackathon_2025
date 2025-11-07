import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { ScheduleFilters, ScheduleStatus, ScheduleType } from '../types/index';

interface AdvancedFiltersProps {
  open: boolean;
  onClose: () => void;
  filters: ScheduleFilters;
  onApplyFilters: (filters: ScheduleFilters) => void;
  onResetFilters: () => void;
}

const scheduleTypes: { value: ScheduleType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'SHIP_ARRIVAL', label: '🚢 Ship Arrival' },
  { value: 'MAINTENANCE', label: '🔧 Maintenance' },
  { value: 'PORT_OPERATION', label: '⚓ Port Operation' },
];

const scheduleStatuses: { value: ScheduleStatus | 'ALL'; label: string; color: string }[] = [
  { value: 'ALL', label: 'All Statuses', color: 'default' },
  { value: 'PENDING', label: 'Pending', color: 'warning' },
  { value: 'SCHEDULED', label: 'Scheduled', color: 'primary' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'info' },
  { value: 'COMPLETED', label: 'Completed', color: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'error' },
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  open,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<ScheduleFilters>(filters);

  const handleFilterChange = (key: keyof ScheduleFilters, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (key: 'start' | 'end', value: Date | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value,
      },
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    setLocalFilters({
      search: '',
      type: 'ALL',
      status: 'ALL',
      dateRange: {
        start: null,
        end: null,
      },
      berthId: null,
    });
  };

  const activeFilterCount = Object.values(localFilters).filter((value) => {
    if (typeof value === 'string') return value !== '' && value !== 'ALL';
    if (value && typeof value === 'object' && 'start' in value) {
      return value.start !== null || value.end !== null;
    }
    return value !== null;
  }).length;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon color="primary" />
            <Typography variant="h6">Advanced Filters</Typography>
            {activeFilterCount > 0 && (
              <Chip label={activeFilterCount} size="small" color="primary" />
            )}
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Search Schedules"
            placeholder="Search by name, ship, berth..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Box>

        {/* Schedule Type */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Schedule Type</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth>
              <Select
                value={localFilters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                {scheduleTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {/* Schedule Status */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Status</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {scheduleStatuses.map((status) => (
                <Chip
                  key={status.value}
                  label={status.label}
                  color={status.value === localFilters.status ? 'primary' : 'default'}
                  onClick={() => handleFilterChange('status', status.value)}
                  variant={status.value === localFilters.status ? 'filled' : 'outlined'}
                  sx={{ justifyContent: 'flex-start' }}
                />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Date Range */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Date Range</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <DatePicker
                label="Start Date"
                value={localFilters.dateRange.start}
                onChange={(value) => handleDateRangeChange('start', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={localFilters.dateRange.end}
                onChange={(value) => handleDateRangeChange('end', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    const today = new Date();
                    handleDateRangeChange('start', today);
                    handleDateRangeChange('end', new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000));
                  }}
                >
                  Next 7 Days
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    const today = new Date();
                    handleDateRangeChange('start', today);
                    handleDateRangeChange('end', new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));
                  }}
                >
                  Next 30 Days
                </Button>
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Time of Day */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Time of Day</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox />}
                label="Morning (06:00 - 12:00)"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Afternoon (12:00 - 18:00)"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Evening (18:00 - 00:00)"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Night (00:00 - 06:00)"
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* Priority */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Priority Level</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ px: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Minimum Priority: 0
              </Typography>
              <Slider
                defaultValue={0}
                min={0}
                max={10}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Recurrence */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Recurrence</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox />}
                label="One-time only"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Daily recurring"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Weekly recurring"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Monthly recurring"
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* Resource Availability */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Resource Requirements</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox />}
                label="Requires Pilot"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Requires Tugboat"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Requires Crane"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Has Conflicts"
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* Actions */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleReset}
          >
            Reset All
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<FilterIcon />}
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AdvancedFilters;
