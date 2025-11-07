import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  Button,
  ButtonGroup,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ViewDay as DayViewIcon,
  ViewWeek as WeekViewIcon,
  ViewMonth as MonthViewIcon,
  Timeline as TimelineIcon,
  BarChart as WorkloadIcon,
  AccountTree as DependenciesIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useResponsive } from '../hooks/useResponsive';
import { TimelineToolbarProps } from '../types';
import { DateRangePicker } from '@mui/lab';

export const ResponsiveTimelineToolbar: React.FC<TimelineToolbarProps> = ({
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
  const { isMobile, isTablet } = useResponsive();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleViewChange = (newView: 'day' | 'week' | 'month') => {
    onViewModeChange(newView);
  };

  const viewButtons = [
    { value: 'day', icon: <DayViewIcon />, label: 'Day' },
    { value: 'week', icon: <WeekViewIcon />, label: 'Week' },
    { value: 'month', icon: <MonthViewIcon />, label: 'Month' },
  ];

  const displayModeButtons = [
    { value: 'timeline', icon: <TimelineIcon />, label: 'Timeline' },
    { value: 'schedule', icon: <WorkloadIcon />, label: 'Workload' },
    { value: 'dependencies', icon: <DependenciesIcon />, label: 'Dependencies' },
  ];

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      gap: { xs: 1, sm: 2 },
      p: { xs: 1, sm: 2 },
      bgcolor: 'background.paper',
      borderBottom: 1,
      borderColor: 'divider',
    }}>
      {/* View Mode Buttons */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <ButtonGroup size={isMobile ? "small" : "medium"}>
          {viewButtons.map((button) => (
            <Button
              key={button.value}
              variant={viewMode === button.value ? 'contained' : 'outlined'}
              onClick={() => handleViewChange(button.value as any)}
              startIcon={!isMobile && button.icon}
            >
              {isMobile ? button.icon : button.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Display Mode & Settings for Mobile */}
      {isMobile ? (
        <>
          <IconButton onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>

          <Drawer
            anchor="right"
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          >
            <List sx={{ width: 250 }}>
              <ListItem>
                <Typography variant="subtitle1">Display Mode</Typography>
              </ListItem>
              {displayModeButtons.map((mode) => (
                <ListItem
                  button
                  key={mode.value}
                  selected={displayMode === mode.value}
                  onClick={() => {
                    onDisplayModeChange(mode.value as any);
                    setSettingsOpen(false);
                  }}
                >
                  <ListItemIcon>{mode.icon}</ListItemIcon>
                  <ListItemText primary={mode.label} />
                </ListItem>
              ))}

              <ListItem>
                <Typography variant="subtitle1">Group By</Typography>
              </ListItem>
              <ListItem>
                <FormControl fullWidth size="small">
                  <Select
                    value={groupBy}
                    onChange={(e) => onGroupByChange(e.target.value as any)}
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="resource">Resource</MenuItem>
                    <MenuItem value="type">Type</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>

              <ListItem>
                <Typography variant="subtitle1">Zoom</Typography>
              </ListItem>
              <ListItem>
                <Slider
                  value={zoom}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onChange={(_, value) => onZoomChange(value as number)}
                  marks
                />
              </ListItem>
            </List>
          </Drawer>
        </>
      ) : (
        /* Desktop Controls */
        <>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ButtonGroup size="medium">
              {displayModeButtons.map((mode) => (
                <Tooltip key={mode.value} title={mode.label}>
                  <Button
                    variant={displayMode === mode.value ? 'contained' : 'outlined'}
                    onClick={() => onDisplayModeChange(mode.value as any)}
                    startIcon={mode.icon}
                  >
                    {mode.label}
                  </Button>
                </Tooltip>
              ))}
            </ButtonGroup>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                label="Group By"
                onChange={(e) => onGroupByChange(e.target.value as any)}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="resource">Resource</MenuItem>
                <MenuItem value="type">Type</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}>
                <ZoomOutIcon />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </Typography>
              <IconButton onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}>
                <ZoomInIcon />
              </IconButton>
            </Box>
          </Box>
        </>
      )}

      {/* Filter Button - Always Visible */}
      <Tooltip title="Filter">
        <IconButton
          onClick={onFilterClick}
          size={isMobile ? "small" : "medium"}
          sx={{ ml: 'auto' }}
        >
          <FilterIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};