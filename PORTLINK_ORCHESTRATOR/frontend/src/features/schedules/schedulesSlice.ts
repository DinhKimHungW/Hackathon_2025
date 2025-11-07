import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.config';

// Import types from types.ts
import type {
  Schedule,
  ScheduleType,
  ScheduleStatus,
  RecurrenceType,
  CalendarView,
  ScheduleFilters,
  CreateScheduleDto,
  UpdateScheduleDto,
} from './types/index';

// ==================== TYPES ====================

export interface SchedulesState {
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  calendarView: CalendarView;
  selectedDate: Date;
  filters: ScheduleFilters;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

// ==================== HELPERS ====================

const normalizeStatus = (status: unknown): ScheduleStatus => {
  if (typeof status !== 'string') {
    return 'SCHEDULED';
  }

  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'PENDING';
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'IN_PROGRESS';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
    case 'CANCELED':
      return 'CANCELLED';
    default:
      return 'SCHEDULED';
  }
};

const normalizeType = (type: unknown): ScheduleType => {
  if (typeof type !== 'string') {
    return 'PORT_OPERATION';
  }

  switch (type.toUpperCase()) {
    case 'SHIP_ARRIVAL':
      return 'SHIP_ARRIVAL';
    case 'MAINTENANCE':
      return 'MAINTENANCE';
    default:
      return 'PORT_OPERATION';
  }
};

const normalizeRecurrence = (value: unknown): RecurrenceType => {
  if (typeof value !== 'string') {
    return 'NONE';
  }

  switch (value.toUpperCase()) {
    case 'DAILY':
      return 'DAILY';
    case 'WEEKLY':
      return 'WEEKLY';
    case 'MONTHLY':
      return 'MONTHLY';
    default:
      return 'NONE';
  }
};

const toIsoString = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return new Date().toISOString();
};

const ensureObject = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
};

const pickString = (value: unknown, fallback?: string): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  return fallback;
};

const transformSchedule = (raw: unknown): Schedule => {
  if (!raw) {
    const nowIso = new Date().toISOString();
    return {
      id: `temp-${Math.random().toString(36).slice(2)}`,
      name: 'Untitled Schedule',
      description: null,
      type: 'PORT_OPERATION',
      status: 'SCHEDULED',
      startTime: nowIso,
      endTime: nowIso,
      berthId: null,
      berthName: undefined,
      shipVisitId: null,
      shipVisitName: undefined,
      recurrence: 'NONE',
      notes: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: 'System',
      updatedBy: 'System',
    };
  }

  const container = ensureObject(raw);
  const candidateRaw =
    'data' in container && !Array.isArray(container.data)
      ? ensureObject(container.data)
      : container;
  const candidate = ensureObject(candidateRaw);
  const shipVisit = ensureObject(candidate.shipVisit);
  const berth = ensureObject(candidate.berth);

  const idValue = candidate.id ?? candidate.scheduleId;
  const nameValue = candidate.name ?? candidate.operation ?? candidate.title;
  const notesValue = candidate.notes ?? candidate.description;
  const berthIdValue = candidate.berthId ?? berth.id;
  const shipVisitIdValue = candidate.shipVisitId ?? shipVisit.id;
  const shipVisitNameValue =
    candidate.shipVisitName ?? shipVisit.vesselName ?? shipVisit.name;
  const berthNameValue =
    candidate.berthName ?? berth.name ?? shipVisit.assignedBerth;

  return {
    id: pickString(idValue, `temp-${Math.random().toString(36).slice(2)}`)!,
    name: pickString(nameValue, 'Untitled Schedule')!,
    description:
      pickString(candidate.description) ?? pickString(notesValue) ?? null,
    type: normalizeType(candidate.type ?? candidate.operationType),
    status: normalizeStatus(candidate.status ?? candidate.state),
    startTime: toIsoString(
      candidate.startTime ?? candidate.actualStartTime ?? candidate.begin
    ),
    endTime: toIsoString(
      candidate.endTime ?? candidate.actualEndTime ?? candidate.finish
    ),
    berthId: pickString(berthIdValue ?? undefined) ?? null,
    berthName: pickString(berthNameValue ?? undefined),
    shipVisitId: pickString(shipVisitIdValue ?? undefined) ?? null,
    shipVisitName: pickString(shipVisitNameValue ?? undefined),
    recurrence: normalizeRecurrence(
      candidate.recurrence ?? candidate.repeatPattern
    ),
    notes: pickString(notesValue ?? undefined) ?? null,
    createdAt: toIsoString(candidate.createdAt ?? candidate.created_at),
    updatedAt: toIsoString(candidate.updatedAt ?? candidate.updated_at),
    createdBy: pickString(candidate.createdBy ?? candidate.created_by, 'System')!,
    updatedBy: pickString(candidate.updatedBy ?? candidate.updated_by, 'System')!,
  };
};

const transformScheduleList = (payload: unknown): Schedule[] => {
  if (Array.isArray(payload)) {
    return payload.map(transformSchedule);
  }

  const container = ensureObject(payload);

  if (Array.isArray(container.data)) {
    return container.data.map(transformSchedule);
  }

  if (Array.isArray(container.items)) {
    return container.items.map(transformSchedule);
  }

  return [];
};

const extractTotalFromPayload = (payload: unknown, fallback: number): number => {
  const container = ensureObject(payload);

  if (typeof container.total === 'number') {
    return container.total;
  }

  return fallback;
};

// ==================== INITIAL STATE ====================

const initialState: SchedulesState = {
  schedules: [],
  currentSchedule: null,
  calendarView: 'week',
  selectedDate: new Date(),
  filters: {
    search: '',
    type: 'ALL',
    status: 'ALL',
    dateRange: {
      start: null,
      end: null,
    },
    berthId: null,
  },
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

// ==================== ASYNC THUNKS ====================

// Fetch all schedules with filters
export const fetchSchedules = createAsyncThunk(
  'schedules/fetchSchedules',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { schedules: SchedulesState };
      const { filters } = state.schedules;

      const params: Record<string, string> = {};

      if (filters.status !== 'ALL') params.status = filters.status;
      if (filters.search) params.operation = filters.search;
      if (filters.dateRange.start) {
        params.fromDate = filters.dateRange.start.toISOString();
      }
      if (filters.dateRange.end) {
        params.toDate = filters.dateRange.end.toISOString();
      }

      const response = await axiosInstance.get('/schedules', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedules');
    }
  }
);

// Fetch schedule by ID
export const fetchScheduleById = createAsyncThunk(
  'schedules/fetchScheduleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/schedules/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedule');
    }
  }
);

// Fetch schedules by date range (for calendar view)
export const fetchSchedulesByDateRange = createAsyncThunk(
  'schedules/fetchSchedulesByDateRange',
  async ({ start, end }: { start: Date; end: Date }, { rejectWithValue }) => {
    try {
      const params = {
        fromDate: start.toISOString(),
        toDate: end.toISOString(),
      };

      const response = await axiosInstance.get('/schedules', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedules');
    }
  }
);

// Create new schedule
export const createSchedule = createAsyncThunk(
  'schedules/createSchedule',
  async (data: CreateScheduleDto, { rejectWithValue }) => {
    try {
      const payload = {
        ...data,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        recurrence: data.recurrence || 'NONE',
      };

      const response = await axiosInstance.post('/schedules', payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create schedule');
    }
  }
);

// Update schedule
export const updateSchedule = createAsyncThunk(
  'schedules/updateSchedule',
  async ({ id, data }: { id: string; data: UpdateScheduleDto }, { rejectWithValue }) => {
    try {
      const payload: any = { ...data };

      if (data.startTime) payload.startTime = data.startTime.toISOString();
      if (data.endTime) payload.endTime = data.endTime.toISOString();

      const response = await axiosInstance.patch(`/schedules/${id}`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update schedule');
    }
  }
);

// Delete schedule
export const deleteSchedule = createAsyncThunk(
  'schedules/deleteSchedule',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/schedules/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete schedule');
    }
  }
);

// Start schedule (change status to IN_PROGRESS)
export const startSchedule = createAsyncThunk(
  'schedules/startSchedule',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/schedules/${id}`, { status: 'IN_PROGRESS' });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start schedule');
    }
  }
);

// Complete schedule (change status to COMPLETED)
export const completeSchedule = createAsyncThunk(
  'schedules/completeSchedule',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/schedules/${id}`, { status: 'COMPLETED' });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete schedule');
    }
  }
);

// Cancel schedule (change status to CANCELLED)
export const cancelSchedule = createAsyncThunk(
  'schedules/cancelSchedule',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/schedules/${id}`, { status: 'CANCELLED' });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel schedule');
    }
  }
);

// ==================== SLICE ====================

const schedulesSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    // Set calendar view (week, month, day)
    setCalendarView: (state, action: PayloadAction<CalendarView>) => {
      state.calendarView = action.payload;
    },

    // Set selected date for calendar
    setSelectedDate: (state, action: PayloadAction<Date>) => {
      state.selectedDate = action.payload;
    },

    // Set filters
    setFilters: (state, action: PayloadAction<Partial<ScheduleFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Clear current schedule
    clearCurrentSchedule: (state) => {
      state.currentSchedule = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // WebSocket real-time updates
    addScheduleRealtime: (state, action: PayloadAction<Schedule>) => {
      const normalized = transformSchedule(action.payload);
      state.schedules.unshift(normalized);
      state.pagination.total += 1;
    },

    updateScheduleRealtime: (state, action: PayloadAction<Schedule>) => {
      const normalized = transformSchedule(action.payload);
      const index = state.schedules.findIndex((s) => s.id === normalized.id);
      if (index !== -1) {
        state.schedules[index] = normalized;
      }
      if (state.currentSchedule?.id === normalized.id) {
        state.currentSchedule = normalized;
      }
    },

    removeScheduleRealtime: (state, action: PayloadAction<string>) => {
      state.schedules = state.schedules.filter((s) => s.id !== action.payload);
      state.pagination.total -= 1;
      if (state.currentSchedule?.id === action.payload) {
        state.currentSchedule = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch schedules
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        const list = transformScheduleList(action.payload);
        state.schedules = list;
        state.pagination.total = extractTotalFromPayload(action.payload, list.length);
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch schedule by ID
    builder
      .addCase(fetchScheduleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSchedule = transformSchedule(action.payload);
      })
      .addCase(fetchScheduleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch schedules by date range
    builder
      .addCase(fetchSchedulesByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedulesByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = transformScheduleList(action.payload);
      })
      .addCase(fetchSchedulesByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create schedule
    builder
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const created = transformSchedule(action.payload);
        state.schedules.unshift(created);
        state.pagination.total += 1;
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update schedule
    builder
      .addCase(updateSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const updated = transformSchedule(action.payload);
        const index = state.schedules.findIndex((s) => s.id === updated.id);
        if (index !== -1) {
          state.schedules[index] = updated;
        }
        if (state.currentSchedule?.id === updated.id) {
          state.currentSchedule = updated;
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete schedule
    builder
      .addCase(deleteSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = state.schedules.filter((s) => s.id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentSchedule?.id === action.payload) {
          state.currentSchedule = null;
        }
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Start schedule
    builder
      .addCase(startSchedule.fulfilled, (state, action) => {
        const started = transformSchedule(action.payload);
        const index = state.schedules.findIndex((s) => s.id === started.id);
        if (index !== -1) {
          state.schedules[index] = started;
        }
        if (state.currentSchedule?.id === started.id) {
          state.currentSchedule = started;
        }
      });

    // Complete schedule
    builder
      .addCase(completeSchedule.fulfilled, (state, action) => {
        const completed = transformSchedule(action.payload);
        const index = state.schedules.findIndex((s) => s.id === completed.id);
        if (index !== -1) {
          state.schedules[index] = completed;
        }
        if (state.currentSchedule?.id === completed.id) {
          state.currentSchedule = completed;
        }
      });

    // Cancel schedule
    builder
      .addCase(cancelSchedule.fulfilled, (state, action) => {
        const cancelled = transformSchedule(action.payload);
        const index = state.schedules.findIndex((s) => s.id === cancelled.id);
        if (index !== -1) {
          state.schedules[index] = cancelled;
        }
        if (state.currentSchedule?.id === cancelled.id) {
          state.currentSchedule = cancelled;
        }
      });
  },
});

// ==================== EXPORTS ====================

export const {
  setCalendarView,
  setSelectedDate,
  setFilters,
  resetFilters,
  clearCurrentSchedule,
  clearError,
  addScheduleRealtime,
  updateScheduleRealtime,
  removeScheduleRealtime,
} = schedulesSlice.actions;

// ==================== SELECTORS ====================

export const selectSchedules = (state: { schedules: SchedulesState }) => state.schedules.schedules;
export const selectCurrentSchedule = (state: { schedules: SchedulesState }) => state.schedules.currentSchedule;
export const selectCalendarView = (state: { schedules: SchedulesState }) => state.schedules.calendarView;
export const selectSelectedDate = (state: { schedules: SchedulesState }) => state.schedules.selectedDate;
export const selectFilters = (state: { schedules: SchedulesState }) => state.schedules.filters;
export const selectSchedulesLoading = (state: { schedules: SchedulesState }) => state.schedules.loading;
export const selectSchedulesError = (state: { schedules: SchedulesState }) => state.schedules.error;
export const selectPagination = (state: { schedules: SchedulesState }) => state.schedules.pagination;

// Active schedule selector - finds the first schedule with status IN_PROGRESS or SCHEDULED
export const selectActiveSchedule = (state: { schedules: SchedulesState }) => {
  const schedules = state.schedules.schedules;
  
  // First try to find a schedule that's currently in progress
  const inProgress = schedules.find(s => s.status === 'IN_PROGRESS');
  if (inProgress) return inProgress;
  
  // Otherwise, return the first scheduled one
  const scheduled = schedules.find(s => s.status === 'SCHEDULED');
  if (scheduled) return scheduled;
  
  // Fallback to the first schedule
  return schedules[0] || null;
};

export default schedulesSlice.reducer;
