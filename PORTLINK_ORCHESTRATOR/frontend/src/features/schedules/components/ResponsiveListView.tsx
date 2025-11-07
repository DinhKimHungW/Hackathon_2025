import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import type { Schedule, ScheduleFilters, ScheduleStatus } from '../types';
import { ScheduleListToolbar } from './ScheduleListToolbar';
import { EnhancedScheduleList } from './EnhancedScheduleList';

interface ResponsiveListViewProps {
  schedules: Schedule[];
  selectedIds: string[];
  filters: ScheduleFilters;
  listDisplayMode: 'list' | 'grid';
  onDisplayModeChange: (mode: 'list' | 'grid') => void;
  onDeleteSelected: () => void;
  onFilterClick: () => void;
  onSearchChange: (term: string) => void;
  onClearFilter: () => void;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onEditSchedule: () => void;
  onDeleteSchedule: (id: string) => void;
  onStartSchedule: (schedule: Schedule) => void;
  onCompleteSchedule: (schedule: Schedule) => void;
  onCancelSchedule: (schedule: Schedule) => void;
  setFilters: (filters: any) => void;
}

export const ResponsiveListView: React.FC<ResponsiveListViewProps> = ({
  schedules,
  selectedIds,
  filters,
  listDisplayMode,
  onDisplayModeChange,
  onDeleteSelected,
  onFilterClick,
  onSearchChange,
  onClearFilter,
  onSelect,
  onSelectAll,
  onEditSchedule,
  onDeleteSchedule,
  onStartSchedule,
  onCompleteSchedule,
  onCancelSchedule,
  setFilters,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <ScheduleListToolbar
        viewMode={listDisplayMode}
        onViewModeChange={onDisplayModeChange}
        selectedCount={selectedIds.length}
        onDeleteSelected={onDeleteSelected}
        onExport={() => {}}
        onFilterClick={onFilterClick}
        onSearchChange={onSearchChange}
        activeFilters={{
          status: filters.status !== 'ALL' ? [filters.status as ScheduleStatus] : undefined,
          type: filters.type ? [filters.type] : undefined,
          dateRange: filters.dateRange ? [
            filters.dateRange.start ? new Date(filters.dateRange.start) : null,
            filters.dateRange.end ? new Date(filters.dateRange.end) : null
          ] : undefined
        }}
        onClearFilter={onClearFilter}
      />

      <Box sx={{ 
        mt: { xs: 1, sm: 2 },
        overflowX: 'auto',
        '& .MuiTable-root': {
          minWidth: isMobile ? 'max-content' : '100%'
        }
      }}>
        <EnhancedScheduleList
          schedules={schedules}
          selectedIds={selectedIds}
          onSelect={onSelect}
          onSelectAll={onSelectAll}
          onEditSchedule={onEditSchedule}
          onDeleteSchedule={onDeleteSchedule}
          onStartSchedule={onStartSchedule}
          onCompleteSchedule={onCompleteSchedule}
          onCancelSchedule={onCancelSchedule}
        />
      </Box>
    </>
  );
};