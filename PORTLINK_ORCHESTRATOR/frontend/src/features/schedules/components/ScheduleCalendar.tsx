import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View, Event as CalendarEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths, startOfMonth, endOfMonth, addWeeks, subWeeks, startOfWeek as weekStart, endOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  ButtonGroup,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarMonthIcon,
  ViewWeek as ViewWeekIcon,
  ViewDay as ViewDayIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchSchedulesByDateRange,
  setCalendarView,
  setSelectedDate,
} from '../schedulesSlice';
import type { Schedule, CalendarView } from '../types/index';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// ==================== LOCALIZER ====================

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// ==================== TYPES ====================

interface CalendarEventWithSchedule extends CalendarEvent {
  resource: Schedule;
}

// ==================== SCHEDULE STATUS COLORS ====================

const getScheduleColor = (schedule: Schedule): string => {
  switch (schedule.status) {
    case 'PENDING':
      return '#f57c00'; // Orange
    case 'SCHEDULED':
      return '#1976d2'; // Blue
    case 'IN_PROGRESS':
      return '#0288d1'; // Light Blue
    case 'COMPLETED':
      return '#2e7d32'; // Green
    case 'CANCELLED':
      return '#d32f2f'; // Red
    default:
      return '#1976d2';
  }
};

const getScheduleTypeIcon = (type: string): string => {
  switch (type) {
    case 'SHIP_ARRIVAL':
      return '🚢';
    case 'MAINTENANCE':
      return '🔧';
    case 'PORT_OPERATION':
      return '⚓';
    default:
      return '📅';
  }
};

// ==================== COMPONENT ====================

export const ScheduleCalendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { schedules, calendarView, selectedDate, loading } = useAppSelector(
    (state) => state.schedules
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const scheduleItems = useMemo(
    () => (Array.isArray(schedules) ? schedules : []),
    [schedules]
  );

  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Convert schedules to calendar events
  const events: CalendarEventWithSchedule[] = useMemo(() => {
    return scheduleItems.map((schedule) => ({
      title: `${getScheduleTypeIcon(schedule.type)} ${schedule.name}`,
      start: new Date(schedule.startTime),
      end: new Date(schedule.endTime),
      resource: schedule,
    }));
  }, [scheduleItems]);

  // Load schedules when date range changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const view = calendarView;
    let start: Date;
    let end: Date;

    if (view === 'month') {
      start = startOfMonth(selectedDate);
      end = endOfMonth(selectedDate);
    } else if (view === 'week') {
      start = weekStart(selectedDate, { weekStartsOn: 0 });
      end = endOfWeek(selectedDate, { weekStartsOn: 0 });
    } else {
      // day view
      start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
    }

    dispatch(fetchSchedulesByDateRange({ start, end }));
  }, [dispatch, isAuthenticated, selectedDate, calendarView]);

  // Handle view change
  const handleViewChange = (view: CalendarView) => {
    dispatch(setCalendarView(view));
  };

  // Handle date navigation
  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    let newDate: Date;

    switch (action) {
      case 'PREV':
        newDate =
          calendarView === 'month'
            ? subMonths(selectedDate, 1)
            : calendarView === 'week'
            ? subWeeks(selectedDate, 1)
            : new Date(selectedDate.getTime() - 86400000); // -1 day
        break;
      case 'NEXT':
        newDate =
          calendarView === 'month'
            ? addMonths(selectedDate, 1)
            : calendarView === 'week'
            ? addWeeks(selectedDate, 1)
            : new Date(selectedDate.getTime() + 86400000); // +1 day
        break;
      case 'TODAY':
        newDate = new Date();
        break;
      default:
        return;
    }

    dispatch(setSelectedDate(newDate));
  };

  // Handle event click
  const handleSelectEvent = (event: CalendarEventWithSchedule) => {
    setSelectedSchedule(event.resource);
    setDetailDialogOpen(true);
  };

  // Custom event style
  const eventStyleGetter = (event: CalendarEventWithSchedule) => {
    const backgroundColor = getScheduleColor(event.resource);
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  // Custom toolbar
  const CustomToolbar = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      {/* Date Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => handleNavigate('PREV')} size="small">
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={() => handleNavigate('TODAY')} size="small">
          <TodayIcon />
        </IconButton>
        <IconButton onClick={() => handleNavigate('NEXT')} size="small">
          <ChevronRightIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2, minWidth: 200 }}>
          {calendarView === 'month'
            ? format(selectedDate, 'MMMM yyyy')
            : calendarView === 'week'
            ? `Week of ${format(weekStart(selectedDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`
            : format(selectedDate, 'MMMM d, yyyy')}
        </Typography>
      </Box>

      {/* View Toggle */}
      <ButtonGroup variant="outlined" size="small">
        <Button
          onClick={() => handleViewChange('day')}
          variant={calendarView === 'day' ? 'contained' : 'outlined'}
          startIcon={<ViewDayIcon />}
        >
          Day
        </Button>
        <Button
          onClick={() => handleViewChange('week')}
          variant={calendarView === 'week' ? 'contained' : 'outlined'}
          startIcon={<ViewWeekIcon />}
        >
          Week
        </Button>
        <Button
          onClick={() => handleViewChange('month')}
          variant={calendarView === 'month' ? 'contained' : 'outlined'}
          startIcon={<CalendarMonthIcon />}
        >
          Month
        </Button>
      </ButtonGroup>
    </Box>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <CustomToolbar />

      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading schedules...</Typography>
        </Box>
      )}

      {!loading && (
        <Box sx={{ height: 'calc(100vh - 300px)', minHeight: 500 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={calendarView as View}
            onView={() => {}} // Controlled by our custom toolbar
            date={selectedDate}
            onNavigate={() => {}} // Controlled by our custom toolbar
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            toolbar={false} // Use custom toolbar
            popup
            selectable
          />
        </Box>
      )}

      {/* Schedule Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedSchedule && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">
                  {getScheduleTypeIcon(selectedSchedule.type)} {selectedSchedule.name}
                </Typography>
                <Chip
                  label={selectedSchedule.status}
                  size="small"
                  sx={{
                    backgroundColor: getScheduleColor(selectedSchedule),
                    color: 'white',
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedSchedule.description && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography>{selectedSchedule.description}</Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography>{selectedSchedule.type.replace('_', ' ')}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Time
                  </Typography>
                  <Typography>
                    {format(new Date(selectedSchedule.startTime), 'PPpp')} -{' '}
                    {format(new Date(selectedSchedule.endTime), 'PPpp')}
                  </Typography>
                </Box>

                {selectedSchedule.berthName && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Berth
                    </Typography>
                    <Typography>{selectedSchedule.berthName}</Typography>
                  </Box>
                )}

                {selectedSchedule.shipVisitName && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ship Visit
                    </Typography>
                    <Typography>{selectedSchedule.shipVisitName}</Typography>
                  </Box>
                )}

                {selectedSchedule.recurrence !== 'NONE' && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Recurrence
                    </Typography>
                    <Typography>{selectedSchedule.recurrence}</Typography>
                  </Box>
                )}

                {selectedSchedule.notes && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography>{selectedSchedule.notes}</Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              <Button variant="contained" onClick={() => setDetailDialogOpen(false)}>
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default ScheduleCalendar;
