import React from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  FilterList,
  Search,
  ViewModule,
  ViewList,
  Download,
  Delete,
} from '@mui/icons-material';
import type { ListToolbarProps as ScheduleListToolbarProps } from '../types';

export const ScheduleListToolbar: React.FC<ScheduleListToolbarProps> = ({
  viewMode,
  onViewModeChange,
  selectedCount,
  onDeleteSelected,
  onExport,
  onFilterClick,
  onSearchChange,
  activeFilters,
  onClearFilter,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* Top Row: Title, Search, and Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {selectedCount > 0 ? `${selectedCount} selected` : 'Schedules'}
        </Typography>

        <TextField
          placeholder="Search schedules..."
          size="small"
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />

        {/* View Mode Toggle */}
        <Box>
          <Tooltip title="List View">
            <IconButton
              color={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => onViewModeChange('list')}
            >
              <ViewList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Grid View">
            <IconButton
              color={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => onViewModeChange('grid')}
            >
              <ViewModule />
            </IconButton>
          </Tooltip>
        </Box>

        {selectedCount > 0 ? (
          <Button
            startIcon={<Delete />}
            variant="contained"
            color="error"
            onClick={onDeleteSelected}
          >
            Delete Selected
          </Button>
        ) : (
          <>
            <Tooltip title="Export">
              <IconButton onClick={onExport}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter">
              <IconButton onClick={onFilterClick}>
                <FilterList />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Active Filters Display */}
      {(activeFilters.status?.length || activeFilters.type?.length || activeFilters.dateRange?.[0]) && (
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Active Filters:
          </Typography>

          {activeFilters.status?.map((status) => (
            <Chip
              key={status}
              label={`Status: ${status}`}
              size="small"
              onDelete={() => onClearFilter('status')}
            />
          ))}

          {activeFilters.type?.map((type) => (
            <Chip
              key={type}
              label={`Type: ${type}`}
              size="small"
              onDelete={() => onClearFilter('type')}
            />
          ))}

          {activeFilters.dateRange?.[0] && (
            <Chip
              label={`Date Range: ${activeFilters.dateRange[0]?.toLocaleDateString()} - ${
                activeFilters.dateRange[1]?.toLocaleDateString() || 'Now'
              }`}
              size="small"
              onDelete={() => onClearFilter('dateRange')}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};