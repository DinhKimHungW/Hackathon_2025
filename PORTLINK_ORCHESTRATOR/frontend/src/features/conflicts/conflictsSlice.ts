import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.config';

// ==================== TYPES ====================

export type ConflictType = 'RESOURCE_OVERLAP' | 'TIME_OVERLAP' | 'LOCATION_OVERLAP' | 'CAPACITY_EXCEEDED';
export type ConflictSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Conflict {
  id: string;
  simulationRunId: string;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  description: string;
  affectedResources: Record<string, any>;
  conflictTime: string;
  suggestedResolution: Record<string, any> | null;
  resolved: boolean;
  resolutionNotes: string | null;
  createdAt: string;
}

export interface ConflictFilters {
  search: string;
  conflictType: ConflictType | 'ALL';
  severity: ConflictSeverity | 'ALL';
  resolved: 'ALL' | 'RESOLVED' | 'UNRESOLVED';
  simulationRunId: string | null;
}

export interface ConflictsState {
  conflicts: Conflict[];
  currentConflict: Conflict | null;
  filters: ConflictFilters;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  stats: {
    total: number;
    unresolved: number;
    critical: number;
    bySeverity: Record<ConflictSeverity, number>;
    byType: Record<ConflictType, number>;
  };
}

export interface CreateConflictDto {
  simulationRunId: string;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  description: string;
  affectedResources: Record<string, any>;
  conflictTime: string;
  suggestedResolution?: Record<string, any>;
}

export interface UpdateConflictDto {
  description?: string;
  severity?: ConflictSeverity;
  suggestedResolution?: Record<string, any>;
  resolved?: boolean;
  resolutionNotes?: string;
}

// ==================== HELPERS ====================

const unwrapResponse = <T>(payload: unknown): T => {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

const ensureConflictArray = (payload: unknown): Conflict[] => {
  const unwrapped = unwrapResponse<unknown>(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped as Conflict[];
  }

  if (unwrapped && typeof unwrapped === 'object') {
    const container = unwrapped as Record<string, unknown>;

    if (Array.isArray(container.data)) {
      return container.data as Conflict[];
    }

    if (Array.isArray(container.items)) {
      return container.items as Conflict[];
    }
  }

  return [];
};

const extractPaginationMeta = (
  payload: unknown,
  fallbackCount: number,
): { total: number; page: number; limit: number } => {
  const unwrapped = unwrapResponse<unknown>(payload);

  if (unwrapped && typeof unwrapped === 'object') {
    const container = unwrapped as Record<string, unknown>;
    const total = typeof container.total === 'number' ? container.total : fallbackCount;
    const page = typeof container.page === 'number' ? container.page : 1;
    const limit = typeof container.limit === 'number' ? container.limit : fallbackCount;

    return { total, page, limit };
  }

  return {
    total: fallbackCount,
    page: 1,
    limit: fallbackCount,
  };
};

const mergeStats = (
  payload: unknown,
): ConflictsState['stats'] => {
  const base: ConflictsState['stats'] = {
    total: 0,
    unresolved: 0,
    critical: 0,
    bySeverity: {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    },
    byType: {
      RESOURCE_OVERLAP: 0,
      TIME_OVERLAP: 0,
      LOCATION_OVERLAP: 0,
      CAPACITY_EXCEEDED: 0,
    },
  };

  const unwrapped = unwrapResponse<unknown>(payload);

  if (unwrapped && typeof unwrapped === 'object') {
    const container = unwrapped as Record<string, any>;

    base.total = typeof container.total === 'number' ? container.total : base.total;
    base.unresolved = typeof container.unresolved === 'number' ? container.unresolved : base.unresolved;
    base.critical = typeof container.critical === 'number' ? container.critical : base.critical;

    if (container.bySeverity && typeof container.bySeverity === 'object') {
      base.bySeverity = {
        ...base.bySeverity,
        ...container.bySeverity,
      };
    }

    if (container.byType && typeof container.byType === 'object') {
      base.byType = {
        ...base.byType,
        ...container.byType,
      };
    }
  }

  return base;
};

// ==================== INITIAL STATE ====================

const initialState: ConflictsState = {
  conflicts: [],
  currentConflict: null,
  filters: {
    search: '',
    conflictType: 'ALL',
    severity: 'ALL',
    resolved: 'UNRESOLVED',
    simulationRunId: null,
  },
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 25,
  },
  stats: {
    total: 0,
    unresolved: 0,
    critical: 0,
    bySeverity: {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    },
    byType: {
      RESOURCE_OVERLAP: 0,
      TIME_OVERLAP: 0,
      LOCATION_OVERLAP: 0,
      CAPACITY_EXCEEDED: 0,
    },
  },
};

// ==================== ASYNC THUNKS ====================

// Fetch Conflicts
export const fetchConflicts = createAsyncThunk(
  'conflicts/fetchConflicts',
  async (
    params: { page?: number; limit?: number; simulationRunId?: string } = {},
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as { conflicts: ConflictsState };
      const { filters } = state.conflicts;

      const { page = 1, limit = 25, simulationRunId } = params;
      const requestParams: Record<string, string | number | undefined> = {
        page,
        limit,
      };

      const effectiveSimulationRunId = simulationRunId ?? filters.simulationRunId ?? undefined;
      if (effectiveSimulationRunId) {
        requestParams.simulationRunId = effectiveSimulationRunId;
      }

      if (filters.conflictType && filters.conflictType !== 'ALL') {
        requestParams.conflictType = filters.conflictType;
      }

      if (filters.severity && filters.severity !== 'ALL') {
        requestParams.severity = filters.severity;
      }

      if (filters.resolved && filters.resolved !== 'ALL') {
        requestParams.resolved = filters.resolved;
      }

      if (filters.search.trim()) {
        requestParams.search = filters.search.trim();
      }

      const response = await axiosInstance.get('/conflicts', {
        params: requestParams,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conflicts');
    }
  }
);

// Fetch Conflict by ID
export const fetchConflictById = createAsyncThunk(
  'conflicts/fetchConflictById',
  async (conflictId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/conflicts/${conflictId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conflict');
    }
  }
);

// Create Conflict
export const createConflict = createAsyncThunk(
  'conflicts/createConflict',
  async (conflictData: CreateConflictDto, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/conflicts', conflictData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create conflict');
    }
  }
);

// Update Conflict
export const updateConflict = createAsyncThunk(
  'conflicts/updateConflict',
  async ({ id, data }: { id: string; data: UpdateConflictDto }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/conflicts/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update conflict');
    }
  }
);

// Resolve Conflict
export const resolveConflict = createAsyncThunk(
  'conflicts/resolveConflict',
  async ({ id, resolutionNotes }: { id: string; resolutionNotes?: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/conflicts/${id}/resolve`, { resolutionNotes });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve conflict');
    }
  }
);

// Delete Conflict
export const deleteConflict = createAsyncThunk(
  'conflicts/deleteConflict',
  async (conflictId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/conflicts/${conflictId}`);
      return conflictId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete conflict');
    }
  }
);

// Fetch Conflicts by Severity
export const fetchConflictsBySeverity = createAsyncThunk(
  'conflicts/fetchConflictsBySeverity',
  async (severity: ConflictSeverity, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/conflicts', {
        params: { severity },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conflicts by severity');
    }
  }
);

// Fetch Unresolved Conflicts
export const fetchUnresolvedConflicts = createAsyncThunk(
  'conflicts/fetchUnresolvedConflicts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/conflicts/unresolved');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unresolved conflicts');
    }
  }
);

// Fetch Conflict Stats
export const fetchConflictStats = createAsyncThunk(
  'conflicts/fetchConflictStats',
  async (simulationRunId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/conflicts/stats', {
        params: { simulationRunId },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conflict stats');
    }
  }
);

// ==================== SLICE ====================

const conflictsSlice = createSlice({
  name: 'conflicts',
  initialState,
  reducers: {
    // Filters
    setFilters: (state, action: PayloadAction<Partial<ConflictFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Current Conflict
    setCurrentConflict: (state, action: PayloadAction<Conflict | null>) => {
      state.currentConflict = action.payload;
    },
    clearCurrentConflict: (state) => {
      state.currentConflict = null;
    },

    // Error
    clearError: (state) => {
      state.error = null;
    },

    // WebSocket Actions
    addConflictRealtime: (state, action: PayloadAction<Conflict>) => {
      state.conflicts.unshift(action.payload);
      state.pagination.total += 1;
      state.stats.total += 1;
      state.stats.unresolved += 1;
      state.stats.bySeverity[action.payload.severity] += 1;
      state.stats.byType[action.payload.conflictType] += 1;
      if (action.payload.severity === 'CRITICAL') {
        state.stats.critical += 1;
      }
    },

    updateConflictRealtime: (state, action: PayloadAction<Conflict>) => {
      const index = state.conflicts.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        const oldConflict = state.conflicts[index];
        // Update stats
        if (oldConflict.resolved !== action.payload.resolved) {
          if (action.payload.resolved) {
            state.stats.unresolved -= 1;
          } else {
            state.stats.unresolved += 1;
          }
        }
        if (oldConflict.severity !== action.payload.severity) {
          state.stats.bySeverity[oldConflict.severity] -= 1;
          state.stats.bySeverity[action.payload.severity] += 1;
          if (oldConflict.severity === 'CRITICAL') {
            state.stats.critical -= 1;
          }
          if (action.payload.severity === 'CRITICAL') {
            state.stats.critical += 1;
          }
        }
        state.conflicts[index] = action.payload;
      }
      if (state.currentConflict?.id === action.payload.id) {
        state.currentConflict = action.payload;
      }
    },

    removeConflictRealtime: (state, action: PayloadAction<string>) => {
      const index = state.conflicts.findIndex((c) => c.id === action.payload);
      if (index !== -1) {
        const conflict = state.conflicts[index];
        state.stats.total -= 1;
        if (!conflict.resolved) {
          state.stats.unresolved -= 1;
        }
        state.stats.bySeverity[conflict.severity] -= 1;
        state.stats.byType[conflict.conflictType] -= 1;
        if (conflict.severity === 'CRITICAL') {
          state.stats.critical -= 1;
        }
        state.conflicts.splice(index, 1);
      }
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.currentConflict?.id === action.payload) {
        state.currentConflict = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Conflicts
    builder
      .addCase(fetchConflicts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConflicts.fulfilled, (state, action) => {
        state.loading = false;
        const conflictsList = ensureConflictArray(action.payload);
        const pagination = extractPaginationMeta(action.payload, conflictsList.length);

        state.conflicts = conflictsList;
        state.pagination.total = pagination.total;
        state.pagination.page = pagination.page;
  state.pagination.limit = pagination.limit > 0 ? pagination.limit : state.pagination.limit;
      })
      .addCase(fetchConflicts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Conflict by ID
    builder
      .addCase(fetchConflictById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConflictById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConflict = unwrapResponse<Conflict | null>(action.payload) ?? null;
      })
      .addCase(fetchConflictById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Conflict
    builder
      .addCase(createConflict.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConflict.fulfilled, (state, action) => {
        state.loading = false;
        const conflict = unwrapResponse<Conflict>(action.payload);
        state.conflicts.unshift(conflict);
        state.pagination.total += 1;
      })
      .addCase(createConflict.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Conflict
    builder
      .addCase(updateConflict.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConflict.fulfilled, (state, action) => {
        state.loading = false;
        const conflict = unwrapResponse<Conflict>(action.payload);
        const index = state.conflicts.findIndex((c) => c.id === conflict.id);
        if (index !== -1) {
          state.conflicts[index] = conflict;
        }
        if (state.currentConflict?.id === conflict.id) {
          state.currentConflict = conflict;
        }
      })
      .addCase(updateConflict.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Resolve Conflict
    builder
      .addCase(resolveConflict.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveConflict.fulfilled, (state, action) => {
        state.loading = false;
        const conflict = unwrapResponse<Conflict>(action.payload);
        const index = state.conflicts.findIndex((c) => c.id === conflict.id);
        if (index !== -1) {
          state.conflicts[index] = conflict;
        }
        if (state.currentConflict?.id === conflict.id) {
          state.currentConflict = conflict;
        }
      })
      .addCase(resolveConflict.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Conflict
    builder
      .addCase(deleteConflict.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteConflict.fulfilled, (state, action) => {
        state.loading = false;
        state.conflicts = state.conflicts.filter((c) => c.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.currentConflict?.id === action.payload) {
          state.currentConflict = null;
        }
      })
      .addCase(deleteConflict.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Conflicts by Severity
    builder
      .addCase(fetchConflictsBySeverity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConflictsBySeverity.fulfilled, (state, action) => {
        state.loading = false;
        const list = ensureConflictArray(action.payload);
        state.conflicts = list;
        state.pagination.total = list.length;
      })
      .addCase(fetchConflictsBySeverity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Unresolved Conflicts
    builder
      .addCase(fetchUnresolvedConflicts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnresolvedConflicts.fulfilled, (state, action) => {
        state.loading = false;
        const list = ensureConflictArray(action.payload);
        state.conflicts = list;
        state.pagination.total = list.length;
      })
      .addCase(fetchUnresolvedConflicts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Conflict Stats
    builder
      .addCase(fetchConflictStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConflictStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = mergeStats(action.payload);
      })
      .addCase(fetchConflictStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  resetFilters,
  setCurrentConflict,
  clearCurrentConflict,
  clearError,
  addConflictRealtime,
  updateConflictRealtime,
  removeConflictRealtime,
} = conflictsSlice.actions;

export default conflictsSlice.reducer;
