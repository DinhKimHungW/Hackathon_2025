import { useState } from 'react';
import {
  Box,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  InputAdornment,
  Chip,
  Typography,
  IconButton,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  Stack,
  type SelectChangeEvent,
} from '@mui/material';
import {
  Search,
  Clear,
  FilterList,
  ExpandMore,
  Save,
  BookmarkBorder,
} from '@mui/icons-material';
import type { ShipVisitsFilters, ShipVisitStatus } from '../shipVisitsSlice';
import DateRangePicker, { type DateRange } from '@/components/common/DateRangePicker';

interface ShipVisitFiltersAdvancedProps {
  filters: ShipVisitsFilters;
  onFilterChange: (filters: Partial<ShipVisitsFilters>) => void;
  onOpenPresets?: () => void;
}

const STATUS_OPTIONS: ShipVisitStatus[] = [
  'PLANNED',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'DEPARTED',
  'CANCELLED',
];

const SHIP_TYPE_OPTIONS = ['CONTAINER', 'BULK', 'TANKER', 'RORO', 'GENERAL', 'PASSENGER'];

const BERTH_OPTIONS = ['B-01', 'B-02', 'B-03', 'B-04', 'B-05', 'B-10', 'B-12', 'B-15', 'B-20'];

export default function ShipVisitFiltersAdvanced({
  filters,
  onFilterChange,
  onOpenPresets,
}: ShipVisitFiltersAdvancedProps) {
  const [expanded, setExpanded] = useState(true);
  const [searchInput, setSearchInput] = useState(filters.search);
  const [selectedStatuses, setSelectedStatuses] = useState<ShipVisitStatus[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBerths, setSelectedBerths] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: filters.dateRange.start,
    to: filters.dateRange.end,
  });

  // Calculate active filter count
  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.status !== 'ALL' ? 1 : 0) +
    (selectedStatuses.length > 0 ? 1 : 0) +
    (selectedTypes.length > 0 ? 1 : 0) +
    (selectedBerths.length > 0 ? 1 : 0) +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);
    // Immediate search (no debounce for better UX)
    onFilterChange({ search: value });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onFilterChange({ search: '' });
  };

  const handleStatusToggle = (status: ShipVisitStatus) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
  };

  const handleBerthToggle = (berth: string) => {
    const newBerths = selectedBerths.includes(berth)
      ? selectedBerths.filter((b) => b !== berth)
      : [...selectedBerths, berth];
    setSelectedBerths(newBerths);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleApplyFilters = () => {
    onFilterChange({
      dateRange: {
        start: dateRange.from,
        end: dateRange.to,
      },
      // TODO: Apply multi-select filters to backend
      // These would need backend support for array filtering
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSelectedBerths([]);
    setDateRange({ from: null, to: null });
    onFilterChange({
      status: 'ALL',
      search: '',
      dateRange: { start: null, end: null },
      portId: 'ALL',
    });
  };

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        mb: 3,
        boxShadow: 2,
        '&:before': { display: 'none' },
        borderRadius: 2,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: expanded ? '8px 8px 0 0' : 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <Badge badgeContent={activeFilterCount} color="primary">
            <FilterList />
          </Badge>
          <Typography variant="subtitle1" fontWeight={600}>
            Advanced Filters
          </Typography>
          {hasActiveFilters && (
            <Chip
              label={`${activeFilterCount} active`}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 3, bgcolor: 'background.default' }}>
        <Stack spacing={3}>
          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search by ship name, IMO number, vessel type..."
            value={searchInput}
            onChange={handleSearchChange}
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

          <Divider />

          {/* Date Range */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              ETA/ETD Date Range
            </Typography>
            <DateRangePicker value={dateRange} onChange={handleDateRangeChange} label="Select Period" />
          </Box>

          <Divider />

          {/* Status Multi-Select */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Status
            </Typography>
            <FormGroup row sx={{ gap: 1 }}>
              {STATUS_OPTIONS.map((status) => (
                <FormControlLabel
                  key={status}
                  control={
                    <Checkbox
                      checked={selectedStatuses.includes(status)}
                      onChange={() => handleStatusToggle(status)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {status.replace('_', ' ')}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </Box>

          <Divider />

          {/* Ship Type Multi-Select */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Ship Type
            </Typography>
            <FormGroup row sx={{ gap: 1 }}>
              {SHIP_TYPE_OPTIONS.map((type) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeToggle(type)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">{type}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>

          <Divider />

          {/* Berth Multi-Select */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Berth
            </Typography>
            <FormGroup row sx={{ gap: 1 }}>
              {BERTH_OPTIONS.map((berth) => (
                <FormControlLabel
                  key={berth}
                  control={
                    <Checkbox
                      checked={selectedBerths.includes(berth)}
                      onChange={() => handleBerthToggle(berth)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">{berth}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>

          <Divider />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                startIcon={<FilterList />}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                startIcon={<Clear />}
                disabled={!hasActiveFilters}
              >
                Clear All
              </Button>
            </Box>
            <Button
              variant="text"
              startIcon={<Save />}
              size="small"
              sx={{ opacity: 0.7 }}
              onClick={onOpenPresets}
              disabled={!onOpenPresets}
            >
              Save Preset
            </Button>
          </Box>

          {/* Filter Summary Chips */}
          {hasActiveFilters && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 0.5 }}>
                Active Filters:
              </Typography>
              {filters.search && (
                <Chip
                  label={`Search: "${filters.search}"`}
                  size="small"
                  onDelete={handleClearSearch}
                />
              )}
              {dateRange.from && (
                <Chip
                  label={`Date: ${dateRange.from.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString() || 'Now'}`}
                  size="small"
                  onDelete={() => setDateRange({ from: null, to: null })}
                />
              )}
              {selectedStatuses.map((status) => (
                <Chip
                  key={status}
                  label={`Status: ${status}`}
                  size="small"
                  onDelete={() => handleStatusToggle(status)}
                />
              ))}
              {selectedTypes.map((type) => (
                <Chip
                  key={type}
                  label={`Type: ${type}`}
                  size="small"
                  onDelete={() => handleTypeToggle(type)}
                />
              ))}
              {selectedBerths.map((berth) => (
                <Chip
                  key={berth}
                  label={`Berth: ${berth}`}
                  size="small"
                  onDelete={() => handleBerthToggle(berth)}
                />
              ))}
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
