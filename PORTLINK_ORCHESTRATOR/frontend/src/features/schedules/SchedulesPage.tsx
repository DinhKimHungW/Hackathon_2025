import { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme, Container, Paper, Typography } from '@mui/material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  ViewList as ViewListIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectUserRole } from '../auth/authSlice';
import {
  fetchSchedules,
  startSchedule,
  completeSchedule,
  cancelSchedule,
  deleteSchedule,
  setFilters,
} from './schedulesSlice';
import type {
  Schedule,
  ScheduleFilters,
  ScheduleStatus,
} from './types';
import type { UserRole } from './types/role-based';
import { useScheduleConfig, useSchedulePermissions } from './hooks/useScheduleConfig';
import { ScheduleTimelineToolbar } from './components/ScheduleTimelineToolbar';
import { ScheduleListToolbar } from './components/ScheduleListToolbar';
import { EnhancedScheduleList } from './components/EnhancedScheduleList';
import { AdminScheduleView } from './components/AdminScheduleView';
import { DriverScheduleView } from './components/DriverScheduleView';
import { ShipScheduleView } from './components/ShipScheduleView';
import { QuickActions } from './components/QuickActions';
import { GanttChart } from './components/GanttChart';
import { ScheduleWorkloadChart } from './components/ScheduleWorkloadChart';
import { ScheduleDependencyGraph } from './components/ScheduleDependencyGraph';
import { ScheduleDetailDialog } from './components/ScheduleDetailDialog';
import { AdvancedFilters } from './components/AdvancedFilters';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default function SchedulesPage() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { schedules, filters } = useAppSelector((state) => state.schedules);
  const userRole = useAppSelector(selectUserRole) as UserRole || 'OPERATIONS';
  const scheduleItems = Array.isArray(schedules) ? schedules : [];
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Role-based configuration
  const scheduleConfig = useScheduleConfig(userRole);
  const permissions = useSchedulePermissions(userRole);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>(
    isMobile ? 'list' : scheduleConfig.defaultView.mode
  );
  const [listDisplayMode, setListDisplayMode] = useState<'list' | 'grid'>(
    isMobile ? 'list' : 'list'
  );
  const [timelineViewMode, setTimelineViewMode] = useState<'day' | 'week' | 'month'>(
    isMobile ? 'day' : scheduleConfig.defaultView.timelineMode || 'week'
  );
  const [displayMode, setDisplayMode] = useState<'timeline' | 'schedule' | 'workload' | 'dependencies'>(
    scheduleConfig.defaultView.displayMode || 'timeline'
  );
  const [groupBy, setGroupBy] = useState<'none' | 'resource' | 'type' | 'status'>(
    scheduleConfig.defaultView.groupBy || 'resource'
  );
  const [zoom, setZoom] = useState(1);
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleViewSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDetailOpen(true);
  };

  const handleStartSchedule = async (schedule: Schedule) => {
    await dispatch(startSchedule(schedule.id));
  };

  const handleCompleteSchedule = async (schedule: Schedule) => {
    await dispatch(completeSchedule(schedule.id));
  };

  const handleCancelSchedule = async (schedule: Schedule) => {
    if (window.confirm('Are you sure you want to cancel this schedule?')) {
      await dispatch(cancelSchedule(schedule.id));
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      await dispatch(deleteSchedule(id));
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} schedules?`)) {
      for (const id of selectedIds) {
        await dispatch(deleteSchedule(id));
      }
      setSelectedIds([]);
    }
  };

  const handleSelectSchedule = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(scheduleItems.map((schedule) => schedule.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleViewModeChange = (mode: 'list' | 'timeline') => {
    setViewMode(mode);
    // Reset timeline view to default when switching to timeline mode
    if (mode === 'timeline') {
      setTimelineViewMode('week');
      setDisplayMode('timeline');
      setGroupBy('resource');
      setZoom(1);
      // Set date range to next 7 days
      const start = startOfWeek(new Date());
      const end = endOfWeek(new Date());
      setDateRange([start, end]);
    }
  };

  const handleTimelinePeriodChange = (period: 'day' | 'week' | 'month') => {
    setTimelineViewMode(period);
    const today = new Date();
    let start: Date, end: Date;
    
    switch (period) {
      case 'day':
        start = today;
        end = addDays(today, 1);
        break;
      case 'week':
        start = startOfWeek(today);
        end = endOfWeek(today);
        break;
      case 'month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
    }
    
    setDateRange([start, end]);
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange([start, end]);
    
    // Automatically adjust view mode based on range
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 1) {
      setTimelineViewMode('day');
    } else if (days <= 7) {
      setTimelineViewMode('week');
    } else {
      setTimelineViewMode('month');
    }
  };

  const handleClearFilters = () => {
    dispatch(setFilters({
      status: 'ALL',
      type: undefined,
      dateRange: { start: null, end: null }
    }));
  };

  const handleApplyFilters = (newFilters: ScheduleFilters) => {
    dispatch(setFilters({
      ...newFilters,
      dateRange: displayMode === 'timeline' ? {
        start: dateRange[0],
        end: dateRange[1]
      } : newFilters.dateRange
    }));
    setFiltersOpen(false);
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    switch (action) {
      case 'create':
        // Open create dialog
        console.log('Create new schedule');
        break;
      case 'filter':
        setFiltersOpen(true);
        break;
      case 'export':
        // Export schedules
        console.log('Export schedules');
        break;
      case 'analytics':
        // Show analytics
        console.log('Show analytics');
        break;
      case 'refresh':
        dispatch(fetchSchedules());
        break;
      case 'assign':
        // Open assign dialog
        console.log('Assign resources');
        break;
      case 'start':
        // Start selected schedule
        console.log('Start task');
        break;
      case 'complete':
        // Complete selected schedule
        console.log('Complete task');
        break;
      case 'report':
        // Open report dialog
        console.log('Report issue');
        break;
      case 'viewRoute':
        // Show route map
        console.log('View route');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  useEffect(() => {
    // Fetch schedules on mount and when filters change
    // Note: Role-based filtering will be handled by backend
    dispatch(fetchSchedules());
  }, [dispatch, filters, userRole]);

  // Responsive effect: Adjust view mode on screen size change
  useEffect(() => {
    if (isMobile && viewMode === 'timeline') {
      setViewMode('list');
      setTimelineViewMode('day');
    }
  }, [isMobile, viewMode]);

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        p: { xs: 1, sm: 2, md: 3 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header với role info */}
      <Box sx={{ 
        mb: { xs: 2, md: 3 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="h1"
          sx={{ fontWeight: 600 }}
        >
          {userRole === 'ADMIN' && 'Quản lý Lịch trình Toàn bộ Cảng'}
          {userRole === 'MANAGER' && 'Quản lý Lịch trình'}
          {userRole === 'OPERATIONS' && 'Lịch trình Tàu của Tôi'}
          {userRole === 'DRIVER' && 'Lịch trình Làm việc'}
        </Typography>
        
        {/* View Mode Switcher - Chỉ hiển thị cho non-mobile và có permission */}
        {!isMobile && permissions.canViewAll && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                handleViewModeChange(newValue as 'list' | 'timeline');
              }
            }}
            aria-label="view mode"
            size={isTablet ? 'small' : 'medium'}
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon sx={{ mr: { xs: 0, sm: 1 } }} />
              {!isTablet && 'Danh sách'}
            </ToggleButton>
            <ToggleButton value="timeline" aria-label="timeline view">
              <TimelineIcon sx={{ mr: { xs: 0, sm: 1 } }} />
              {!isTablet && 'Timeline'}
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      {/* Main content with view mode switching */}
      <Paper 
        elevation={isMobile ? 0 : 1} 
        sx={{ 
          mt: 2, 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: { xs: 0, sm: 1 },
        }}
      >
        {/* List View */}
        {viewMode === 'list' && (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <ScheduleListToolbar
              viewMode={listDisplayMode}
              onViewModeChange={setListDisplayMode}
              selectedCount={selectedIds.length}
              onDeleteSelected={handleDeleteSelected}
              onExport={permissions.canExport ? () => {} : () => {}}
              onFilterClick={permissions.canFilter ? () => setFiltersOpen(true) : () => {}}
              onSearchChange={(term) => {
                if (term) {
                  dispatch(setFilters({ ...filters, searchTerm: term }));
                } else {
                  const { searchTerm, ...rest } = filters;
                  dispatch(setFilters(rest));
                }
              }}
              activeFilters={{
                status: filters.status !== 'ALL' ? [filters.status as ScheduleStatus] : undefined,
                type: filters.type ? [filters.type] : undefined,
                dateRange: filters.dateRange ? [
                  filters.dateRange.start ? new Date(filters.dateRange.start) : null,
                  filters.dateRange.end ? new Date(filters.dateRange.end) : null
                ] : undefined
              }}
              onClearFilter={handleClearFilters}
            />

            <Box sx={{ 
              mt: 2, 
              flex: 1,
              overflow: 'auto',
              px: { xs: 0, sm: 2 },
            }}>
              {/* Role-based List View */}
              {userRole === 'ADMIN' && viewMode === 'list' ? (
                <AdminScheduleView
                  schedules={scheduleItems}
                  onScheduleClick={handleViewSchedule}
                  onFilterChange={(entityType) => {
                    // Handle entity-based filtering
                    console.log('Filter by entity:', entityType);
                  }}
                />
              ) : userRole === 'DRIVER' ? (
                <DriverScheduleView
                  schedules={scheduleItems}
                  onScheduleClick={handleViewSchedule}
                />
              ) : userRole === 'OPERATIONS' || userRole === 'MANAGER' ? (
                <ShipScheduleView
                  schedules={scheduleItems}
                  onScheduleClick={handleViewSchedule}
                />
              ) : (
                // Fallback to enhanced list for other cases
                <EnhancedScheduleList
                  schedules={scheduleItems}
                  selectedIds={selectedIds}
                  onSelect={handleSelectSchedule}
                  onSelectAll={handleSelectAll}
                  onEditSchedule={permissions.canEdit ? () => {} : () => {}}
                  onDeleteSchedule={permissions.canDelete ? handleDeleteSchedule : () => {}}
                  onStartSchedule={handleStartSchedule}
                  onCompleteSchedule={handleCompleteSchedule}
                  onCancelSchedule={handleCancelSchedule}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <ScheduleTimelineToolbar
              viewMode={timelineViewMode}
              onViewModeChange={setTimelineViewMode}
              groupBy={groupBy}
              onGroupByChange={setGroupBy}
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
              zoom={zoom}
              onZoomChange={setZoom}
              onFilterClick={() => setFiltersOpen(true)}
              dateRange={dateRange}
            />

            <Box sx={{ 
              mt: 2, 
              flex: 1,
              overflow: 'auto',
              position: 'relative',
            }}>
              {displayMode === 'timeline' && (
                <GanttChart
                  schedules={scheduleItems}
                  onScheduleClick={handleViewSchedule}
                  height={600}
                />
              )}

              {displayMode === 'schedule' && (
                <ScheduleWorkloadChart
                  schedules={scheduleItems}
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                />
              )}

              {displayMode === 'dependencies' && (
                <ScheduleDependencyGraph 
                  schedules={scheduleItems}
                />
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Dialogs */}
      {selectedSchedule && (
        <ScheduleDetailDialog
          open={detailOpen}
          schedule={selectedSchedule}
          onClose={() => setDetailOpen(false)}
          onEdit={permissions.canEdit ? () => {} : () => {}}
          onDelete={permissions.canDelete ? () => handleDeleteSchedule(selectedSchedule.id) : () => {}}
          onStart={() => handleStartSchedule(selectedSchedule)}
          onComplete={() => handleCompleteSchedule(selectedSchedule)}
          onCancel={() => handleCancelSchedule(selectedSchedule)}
        />
      )}

      {permissions.canFilter && (
        <AdvancedFilters
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleClearFilters}
        />
      )}

      {/* Quick Actions FAB for mobile */}
      <QuickActions
        userRole={userRole}
        onAction={handleQuickAction}
        permissions={{
          canCreate: permissions.canCreate,
          canExport: permissions.canExport,
          canFilter: permissions.canFilter,
        }}
      />
    </Container>
  );
}

