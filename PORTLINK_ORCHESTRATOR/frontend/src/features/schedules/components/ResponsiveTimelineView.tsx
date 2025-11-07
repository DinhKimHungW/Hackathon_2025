import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import type { Schedule, ViewMode, GroupBy, DisplayMode } from '../types';
import { ScheduleTimelineToolbar } from './ScheduleTimelineToolbar';
import { GanttChart } from './GanttChart';
import { ScheduleWorkloadChart } from './ScheduleWorkloadChart';
import { ScheduleDependencyGraph } from './ScheduleDependencyGraph';

interface ResponsiveTimelineViewProps {
  schedules: Schedule[];
  timelineViewMode: ViewMode;
  displayMode: DisplayMode;
  groupBy: GroupBy;
  zoom: number;
  dateRange: [Date, Date];
  onTimelinePeriodChange: (period: ViewMode) => void;
  onGroupByChange: (groupBy: GroupBy) => void;
  onDisplayModeChange: (mode: DisplayMode) => void;
  onZoomChange: (zoom: number) => void;
  onFilterClick: () => void;
  onScheduleClick: (schedule: Schedule) => void;
}

export const ResponsiveTimelineView: React.FC<ResponsiveTimelineViewProps> = ({
  schedules,
  timelineViewMode,
  displayMode,
  groupBy,
  zoom,
  dateRange,
  onTimelinePeriodChange,
  onGroupByChange,
  onDisplayModeChange,
  onZoomChange,
  onFilterClick,
  onScheduleClick
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <ScheduleTimelineToolbar
        viewMode={timelineViewMode}
        onViewModeChange={onTimelinePeriodChange}
        groupBy={groupBy}
        onGroupByChange={onGroupByChange}
        displayMode={displayMode}
        onDisplayModeChange={onDisplayModeChange}
        zoom={zoom}
        onZoomChange={onZoomChange}
        onFilterClick={onFilterClick}
        dateRange={dateRange}
      />

      <Box sx={{ 
        mt: { xs: 1, sm: 2 }, 
        height: isMobile ? 'calc(100vh - 150px)' : 'calc(100vh - 200px)',
        overflow: 'auto'
      }}>
        {displayMode === 'timeline' && (
          <GanttChart
            schedules={schedules}
            onScheduleClick={onScheduleClick}
            config={{
              startDate: dateRange[0],
              endDate: dateRange[1],
              viewMode: timelineViewMode,
              grouping: groupBy,
              zoomLevel: zoom
            }}
          />
        )}

        {displayMode === 'schedule' && (
          <ScheduleWorkloadChart
            schedules={schedules}
            period={{
              start: dateRange[0],
              end: dateRange[1],
              type: timelineViewMode
            }}
          />
        )}

        {displayMode === 'dependencies' && (
          <ScheduleDependencyGraph 
            schedules={schedules}
            onClick={onScheduleClick}
          />
        )}
      </Box>
    </>
  );
};