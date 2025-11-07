import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CalendarToday,
  CalendarViewWeek,
  CalendarViewMonth,
  ZoomIn,
  ZoomOut,
  ZoomOutMap,
  FilterList,
  ViewAgenda,
  ViewDay,
  ViewWeek,
  AccountTree,
  Assessment,
} from '@mui/icons-material';

import type { TimelineToolbarProps } from '../types';

export const ScheduleTimelineToolbar: React.FC<TimelineToolbarProps> = ({
  viewMode,
  onViewModeChange,
  groupBy,
  onGroupByChange,
  displayMode,
  onDisplayModeChange,
  zoom,
  onZoomChange,
  onFilterClick,
  dateRange,
}) => {
  const [start, end] = dateRange;

  return (
    <Box sx={{ mb: 2 }}>
      <Paper sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Time Range Controls */}
          <ButtonGroup size="small" variant="outlined">
            <Button
              startIcon={<CalendarToday />}
              onClick={() => onViewModeChange('day')}
              variant={viewMode === 'day' ? 'contained' : 'outlined'}
            >
              Day
            </Button>
            <Button
              startIcon={<CalendarViewWeek />}
              onClick={() => onViewModeChange('week')}
              variant={viewMode === 'week' ? 'contained' : 'outlined'}
            >
              Week
            </Button>
            <Button
              startIcon={<CalendarViewMonth />}
              onClick={() => onViewModeChange('month')}
              variant={viewMode === 'month' ? 'contained' : 'outlined'}
            >
              Month
            </Button>
          </ButtonGroup>

          {/* Display Mode */}
          <ToggleButtonGroup 
            size="small" 
            value={displayMode}
            exclusive
            onChange={(_, value) => value && onDisplayModeChange(value)}
          >
            <ToggleButton value="timeline">
              <Tooltip title="Timeline View">
                <ViewDay />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="schedule">
              <Tooltip title="Schedule View">
                <ViewWeek />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="workload">
              <Tooltip title="Workload View">
                <Assessment />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="dependencies">
              <Tooltip title="Dependencies View">
                <AccountTree />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Group By */}
          <ToggleButtonGroup
            size="small"
            value={groupBy}
            exclusive
            onChange={(_, value) => value && onGroupByChange(value)}
          >
            <ToggleButton value="none">
              <Tooltip title="No Grouping">
                <ViewAgenda />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="resource">
              <Tooltip title="Group by Resource">
                <ViewWeek />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="type">
              <Tooltip title="Group by Type">
                <ViewDay />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="status">
              <Tooltip title="Group by Status">
                <Assessment />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Zoom Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton 
              size="small" 
              onClick={() => onZoomChange(zoom - 0.2)}
              disabled={zoom <= 0.5}
            >
              <ZoomOut fontSize="small" />
            </IconButton>
            <Chip 
              label={`${Math.round(zoom * 100)}%`}
              size="small"
              onClick={() => onZoomChange(1)}
            />
            <IconButton 
              size="small" 
              onClick={() => onZoomChange(zoom + 0.2)}
              disabled={zoom >= 3}
            >
              <ZoomIn fontSize="small" />
            </IconButton>
            <IconButton 
              size="small"
              onClick={() => onZoomChange(1)}
            >
              <ZoomOutMap fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Filters */}
          <IconButton onClick={onFilterClick}>
            <FilterList />
          </IconButton>
        </Box>

        {/* Date Range Display */}
        <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'right', color: 'text.secondary' }}>
          Showing: {start.toLocaleDateString()} - {end.toLocaleDateString()}
        </Typography>
      </Paper>
    </Box>
  );
};