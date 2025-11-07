import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.config';

// ==================== TYPES ====================

export type EventType =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'ASSET_UPDATE'
  | 'SCHEDULE_CREATE'
  | 'SCHEDULE_UPDATE'
  | 'TASK_CREATE'
  | 'TASK_UPDATE'
  | 'SIMULATION_START'
  | 'SIMULATION_COMPLETE'
  | 'CONFLICT_DETECTED'
  | 'CONFLICT_RESOLVED'
  | 'SYSTEM_ERROR'
  | 'DATA_EXPORT'
  | 'DATA_IMPORT';

export type EventSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface EventLog {
  id: string;
  eventType: EventType;
  severity: EventSeverity;
  userId: string | null;
  entityType: string | null;
  entityId: string | null;
  description: string;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface EventLogFilters {
  search: string;
  eventType: EventType | 'ALL';
  severity: EventSeverity | 'ALL';
  userId: string | null;
  entityType: string | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface EventLogsState {
  eventLogs: EventLog[];
  currentEventLog: EventLog | null;
  filters: EventLogFilters;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  stats: {
    total: number;
    bySeverity: Record<EventSeverity, number>;
    byEventType: Partial<Record<EventType, number>>;
    recentErrors: number;
  };
}

export interface CreateEventLogDto {
  eventType: EventType;
  severity?: EventSeverity;
  entityType?: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
}

// ==================== INITIAL STATE ====================

const initialState: EventLogsState = {
  eventLogs: [],
  currentEventLog: null,
  filters: {
    search: '',
    eventType: 'ALL',
    severity: 'ALL',
    userId: null,
    entityType: null,
    dateRange: {
      start: null,
      end: null,
    },
  },
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 50,
  },
  stats: {
    total: 0,
    bySeverity: {
      INFO: 0,
      WARNING: 0,
      ERROR: 0,
      CRITICAL: 0,
    },
    byEventType: {},
    recentErrors: 0,
  },
};

// ==================== ASYNC THUNKS ====================

// Fetch Event Logs
export const fetchEventLogs = createAsyncThunk(
  'eventLogs/fetchEventLogs',
  async (
    params: {
      page?: number;
      limit?: number;
      eventType?: EventType;
      severity?: EventSeverity;
      userId?: string;
      startDate?: string;
      endDate?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { page = 1, limit = 50, ...filters } = params;
      const response = await axiosInstance.get('/event-logs', {
        params: { page, limit, ...filters },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event logs');
    }
  }
);

// Fetch Event Log by ID
export const fetchEventLogById = createAsyncThunk(
  'eventLogs/fetchEventLogById',
  async (eventLogId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/event-logs/${eventLogId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event log');
    }
  }
);

// Create Event Log
export const createEventLog = createAsyncThunk(
  'eventLogs/createEventLog',
  async (eventLogData: CreateEventLogDto, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/event-logs', eventLogData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create event log');
    }
  }
);

// Delete Event Log
export const deleteEventLog = createAsyncThunk(
  'eventLogs/deleteEventLog',
  async (eventLogId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/event-logs/${eventLogId}`);
      return eventLogId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete event log');
    }
  }
);

// Fetch Event Logs by Type
export const fetchEventLogsByType = createAsyncThunk(
  'eventLogs/fetchEventLogsByType',
  async (eventType: EventType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/event-logs', {
        params: { eventType },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event logs by type');
    }
  }
);

// Fetch Event Logs by Severity
export const fetchEventLogsBySeverity = createAsyncThunk(
  'eventLogs/fetchEventLogsBySeverity',
  async (severity: EventSeverity, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/event-logs', {
        params: { severity },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event logs by severity');
    }
  }
);

// Fetch Event Logs by User
export const fetchEventLogsByUser = createAsyncThunk(
  'eventLogs/fetchEventLogsByUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/event-logs', {
        params: { userId },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event logs by user');
    }
  }
);

// Fetch Recent Errors
export const fetchRecentErrors = createAsyncThunk(
  'eventLogs/fetchRecentErrors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/event-logs/recent-errors');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent errors');
    }
  }
);

// Fetch Event Log Stats
export const fetchEventLogStats = createAsyncThunk(
  'eventLogs/fetchEventLogStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/event-logs/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event log stats');
    }
  }
);

// ==================== SLICE ====================

const eventLogsSlice = createSlice({
  name: 'eventLogs',
  initialState,
  reducers: {
    // Filters
    setFilters: (state, action: PayloadAction<Partial<EventLogFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Current Event Log
    setCurrentEventLog: (state, action: PayloadAction<EventLog | null>) => {
      state.currentEventLog = action.payload;
    },
    clearCurrentEventLog: (state) => {
      state.currentEventLog = null;
    },

    // Error
    clearError: (state) => {
      state.error = null;
    },

    // WebSocket Actions
    addEventLogRealtime: (state, action: PayloadAction<EventLog>) => {
      state.eventLogs.unshift(action.payload);
      state.pagination.total += 1;
      state.stats.total += 1;
      state.stats.bySeverity[action.payload.severity] += 1;
      const eventType = action.payload.eventType;
      state.stats.byEventType[eventType] = (state.stats.byEventType[eventType] || 0) + 1;
      if (action.payload.severity === 'ERROR' || action.payload.severity === 'CRITICAL') {
        state.stats.recentErrors += 1;
      }
    },

    removeEventLogRealtime: (state, action: PayloadAction<string>) => {
      const index = state.eventLogs.findIndex((e) => e.id === action.payload);
      if (index !== -1) {
        const eventLog = state.eventLogs[index];
        state.stats.total -= 1;
        state.stats.bySeverity[eventLog.severity] -= 1;
        const eventType = eventLog.eventType;
        if (state.stats.byEventType[eventType]) {
          state.stats.byEventType[eventType]! -= 1;
        }
        if (eventLog.severity === 'ERROR' || eventLog.severity === 'CRITICAL') {
          state.stats.recentErrors = Math.max(0, state.stats.recentErrors - 1);
        }
        state.eventLogs.splice(index, 1);
      }
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.currentEventLog?.id === action.payload) {
        state.currentEventLog = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Event Logs
    builder
      .addCase(fetchEventLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.eventLogs = action.payload.data || action.payload;
        state.pagination.total = action.payload.total || action.payload.length;
        state.pagination.page = action.payload.page || 1;
        state.pagination.limit = action.payload.limit || 50;
      })
      .addCase(fetchEventLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Event Log by ID
    builder
      .addCase(fetchEventLogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventLogById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEventLog = action.payload;
      })
      .addCase(fetchEventLogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Event Log
    builder
      .addCase(createEventLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEventLog.fulfilled, (state, action) => {
        state.loading = false;
        state.eventLogs.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createEventLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Event Log
    builder
      .addCase(deleteEventLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEventLog.fulfilled, (state, action) => {
        state.loading = false;
        state.eventLogs = state.eventLogs.filter((e) => e.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.currentEventLog?.id === action.payload) {
          state.currentEventLog = null;
        }
      })
      .addCase(deleteEventLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Event Logs by Type
    builder
      .addCase(fetchEventLogsByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventLogsByType.fulfilled, (state, action) => {
        state.loading = false;
        state.eventLogs = action.payload;
      })
      .addCase(fetchEventLogsByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Event Logs by Severity
    builder
      .addCase(fetchEventLogsBySeverity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventLogsBySeverity.fulfilled, (state, action) => {
        state.loading = false;
        state.eventLogs = action.payload;
      })
      .addCase(fetchEventLogsBySeverity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Event Logs by User
    builder
      .addCase(fetchEventLogsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventLogsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.eventLogs = action.payload;
      })
      .addCase(fetchEventLogsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Recent Errors
    builder
      .addCase(fetchRecentErrors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentErrors.fulfilled, (state, action) => {
        state.loading = false;
        state.eventLogs = action.payload;
      })
      .addCase(fetchRecentErrors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Event Log Stats
    builder
      .addCase(fetchEventLogStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventLogStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchEventLogStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  resetFilters,
  setCurrentEventLog,
  clearCurrentEventLog,
  clearError,
  addEventLogRealtime,
  removeEventLogRealtime,
} = eventLogsSlice.actions;

export default eventLogsSlice.reducer;
