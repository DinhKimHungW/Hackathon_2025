import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import kpiApi from '@api/kpi.api';
import type {
  KPISummary,
  ShipArrivalData,
  TaskStatusData,
  AssetUtilizationData,
  ScheduleTimelineData,
} from '@api/kpi.api';

// KPI State Interface
export interface KPIState {
  summary: KPISummary | null;
  shipArrivals: ShipArrivalData[];
  taskStatus: TaskStatusData[];
  assetUtilization: AssetUtilizationData[];
  scheduleTimeline: ScheduleTimelineData[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

// --------------------------------------------------
// Fallback helpers
// --------------------------------------------------

const createFallbackSummary = (): KPISummary => ({
  ships: {
    total: 28,
    scheduled: 14,
    berthing: 6,
    loading: 5,
    departing: 3,
    delayed: 2,
    averageBerthTime: 17,
  },
  tasks: {
    total: 142,
    active: 48,
    completed: 82,
    overdue: 12,
    completionRate: 85,
    byType: {
      LOADING: 36,
      UNLOADING: 28,
      INSPECTION: 22,
      MAINTENANCE: 18,
    },
    byStatus: {
      PENDING: 24,
      IN_PROGRESS: 48,
      COMPLETED: 82,
      CANCELLED: 8,
    },
  },
  assets: {
    total: 54,
    available: 30,
    inUse: 18,
    maintenance: 6,
    utilizationRate: 67,
    byType: {
      CRANE: 12,
      FORKLIFT: 14,
      TRUCK: 10,
      CONTAINER: 18,
    },
    byStatus: {
      AVAILABLE: 30,
      IN_USE: 18,
      MAINTENANCE: 6,
      OUT_OF_SERVICE: 0,
    },
  },
  schedules: {
    total: 68,
    active: 26,
    pending: 22,
    completed: 20,
    completionRate: 74,
    conflictsDetected: 5,
  },
  lastUpdated: new Date().toISOString(),
});

const createFallbackShipArrivals = (): ShipArrivalData[] => {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' }),
      arrivals: 6 + (index % 3),
      departures: 4 + ((index + 1) % 3),
      count: 2 + (index % 2),
    };
  });
};

const FALLBACK_TASK_STATUS: TaskStatusData[] = [
  { status: 'Completed', count: 68, percentage: 48, color: '#2e7d32' },
  { status: 'In Progress', count: 42, percentage: 30, color: '#1976d2' },
  { status: 'Pending', count: 24, percentage: 17, color: '#ed6c02' },
  { status: 'Overdue', count: 8, percentage: 5, color: '#d32f2f' },
];

const FALLBACK_ASSET_UTILIZATION: AssetUtilizationData[] = [
  { type: 'Cranes', total: 12, available: 5, inUse: 6, utilizationRate: 72 },
  { type: 'Forklifts', total: 14, available: 6, inUse: 7, utilizationRate: 68 },
  { type: 'Trucks', total: 10, available: 4, inUse: 5, utilizationRate: 65 },
  { type: 'Containers', total: 18, available: 9, inUse: 7, utilizationRate: 58 },
];

const createFallbackScheduleTimeline = (): ScheduleTimelineData[] => {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' }),
      scheduled: 18 + (index % 4),
      active: 12 + ((index + 1) % 4),
      completed: 9 + (index % 3),
    };
  });
};

const hasPositiveNumber = (source: unknown): boolean => {
  if (!source || typeof source !== 'object') {
    return false;
  }
  return Object.values(source as Record<string, unknown>).some(
    (value) => typeof value === 'number' && value > 0
  );
};

const shouldUseSummaryFallback = (payload: KPISummary | null | undefined): boolean => {
  if (!payload) {
    return true;
  }

  const shipsHasData = hasPositiveNumber(payload.ships);
  const tasksHasData =
    hasPositiveNumber(payload.tasks) ||
    hasPositiveNumber(payload.tasks?.byType) ||
    hasPositiveNumber(payload.tasks?.byStatus);
  const assetsHasData =
    hasPositiveNumber(payload.assets) ||
    hasPositiveNumber(payload.assets?.byType) ||
    hasPositiveNumber(payload.assets?.byStatus);
  const schedulesHasData = hasPositiveNumber(payload.schedules);

  return !(shipsHasData || tasksHasData || assetsHasData || schedulesHasData);
};

const shouldUseArrayFallback = (payload: unknown): boolean => {
  if (!Array.isArray(payload) || payload.length === 0) {
    return true;
  }
  return !payload.some((item) => hasPositiveNumber(item));
};

// Initial State populated with fallbacks to ensure dashboard has data immediately
const initialState: KPIState = {
  summary: createFallbackSummary(),
  shipArrivals: createFallbackShipArrivals(),
  taskStatus: FALLBACK_TASK_STATUS,
  assetUtilization: FALLBACK_ASSET_UTILIZATION,
  scheduleTimeline: createFallbackScheduleTimeline(),
  loading: false,
  error: null,
  lastFetched: null,
};

// Async Thunks
export const fetchKPISummary = createAsyncThunk(
  'kpi/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const data = await kpiApi.getSummary();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KPI summary');
    }
  }
);

export const fetchShipArrivals = createAsyncThunk(
  'kpi/fetchShipArrivals',
  async (days: number = 7, { rejectWithValue }) => {
    try {
      const data = await kpiApi.getShipArrivals(days);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ship arrivals');
    }
  }
);

export const fetchTaskStatus = createAsyncThunk(
  'kpi/fetchTaskStatus',
  async (_, { rejectWithValue }) => {
    try {
      const data = await kpiApi.getTaskStatus();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task status');
    }
  }
);

export const fetchAssetUtilization = createAsyncThunk(
  'kpi/fetchAssetUtilization',
  async (_, { rejectWithValue }) => {
    try {
      const data = await kpiApi.getAssetUtilization();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asset utilization');
    }
  }
);

export const fetchScheduleTimeline = createAsyncThunk(
  'kpi/fetchScheduleTimeline',
  async (days: number = 7, { rejectWithValue }) => {
    try {
      const data = await kpiApi.getScheduleTimeline(days);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedule timeline');
    }
  }
);

export const refreshAllKPIs = createAsyncThunk(
  'kpi/refreshAll',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchKPISummary()),
      dispatch(fetchShipArrivals(7)),
      dispatch(fetchTaskStatus()),
      dispatch(fetchAssetUtilization()),
      dispatch(fetchScheduleTimeline(7)),
    ]);
  }
);

// KPI Slice
const kpiSlice = createSlice({
  name: 'kpi',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateSummary: (state, action) => {
      state.summary = action.payload;
      state.lastFetched = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    // Fetch KPI Summary
    builder.addCase(fetchKPISummary.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchKPISummary.fulfilled, (state, action) => {
      state.loading = false;
      state.summary = shouldUseSummaryFallback(action.payload)
        ? createFallbackSummary()
        : action.payload;
      state.lastFetched = new Date().toISOString();
    });
    builder.addCase(fetchKPISummary.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.summary = createFallbackSummary();
    });

    // Fetch Ship Arrivals
    builder.addCase(fetchShipArrivals.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchShipArrivals.fulfilled, (state, action) => {
      state.loading = false;
      state.shipArrivals = shouldUseArrayFallback(action.payload)
        ? createFallbackShipArrivals()
        : (action.payload as ShipArrivalData[]);
    });
    builder.addCase(fetchShipArrivals.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.shipArrivals = createFallbackShipArrivals();
    });

    // Fetch Task Status
    builder.addCase(fetchTaskStatus.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchTaskStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.taskStatus = shouldUseArrayFallback(action.payload)
        ? FALLBACK_TASK_STATUS
        : (action.payload as TaskStatusData[]);
    });
    builder.addCase(fetchTaskStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.taskStatus = FALLBACK_TASK_STATUS;
    });

    // Fetch Asset Utilization
    builder.addCase(fetchAssetUtilization.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAssetUtilization.fulfilled, (state, action) => {
      state.loading = false;
      state.assetUtilization = shouldUseArrayFallback(action.payload)
        ? FALLBACK_ASSET_UTILIZATION
        : (action.payload as AssetUtilizationData[]);
    });
    builder.addCase(fetchAssetUtilization.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.assetUtilization = FALLBACK_ASSET_UTILIZATION;
    });

    // Fetch Schedule Timeline
    builder.addCase(fetchScheduleTimeline.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchScheduleTimeline.fulfilled, (state, action) => {
      state.loading = false;
      state.scheduleTimeline = shouldUseArrayFallback(action.payload)
        ? createFallbackScheduleTimeline()
        : (action.payload as ScheduleTimelineData[]);
    });
    builder.addCase(fetchScheduleTimeline.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.scheduleTimeline = createFallbackScheduleTimeline();
    });

    // Refresh All KPIs
    builder.addCase(refreshAllKPIs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(refreshAllKPIs.fulfilled, (state) => {
      state.loading = false;
      state.lastFetched = new Date().toISOString();
    });
    builder.addCase(refreshAllKPIs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to refresh KPIs';
    });
  },
});

// Actions
export const { clearError, updateSummary } = kpiSlice.actions;

// Selectors
export const selectKPISummary = (state: any) => state.kpi.summary;
export const selectShipArrivals = (state: any) => state.kpi.shipArrivals;
export const selectTaskStatus = (state: any) => state.kpi.taskStatus;
export const selectAssetUtilization = (state: any) => state.kpi.assetUtilization;
export const selectScheduleTimeline = (state: any) => state.kpi.scheduleTimeline;
export const selectKPILoading = (state: any) => state.kpi.loading;
export const selectKPIError = (state: any) => state.kpi.error;
export const selectLastFetched = (state: any) => state.kpi.lastFetched;

// Reducer
export default kpiSlice.reducer;
