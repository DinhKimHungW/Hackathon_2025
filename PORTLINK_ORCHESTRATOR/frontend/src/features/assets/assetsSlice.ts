import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.config';

// ==================== TYPES ====================

export type AssetType = 'CRANE' | 'TRUCK' | 'REACH_STACKER' | 'FORKLIFT' | 'YARD_TRACTOR' | 'OTHER';
export type AssetStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OFFLINE';

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  capacity: number | null;
  capacityUnit: string | null;
  location: string | null;
  utilizationRate: number | null;
  specifications: Record<string, any> | null;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetFilters {
  search: string;
  type: AssetType | 'ALL';
  status: AssetStatus | 'ALL';
  location: string | null;
  maintenanceDue: boolean;
}

export interface AssetsState {
  assets: Asset[];
  currentAsset: Asset | null;
  filters: AssetFilters;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CreateAssetDto {
  assetCode: string;
  name: string;
  type: AssetType;
  capacity?: number;
  capacityUnit?: string;
  location?: string;
  specifications?: Record<string, any>;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  notes?: string;
}

export interface UpdateAssetDto extends Partial<CreateAssetDto> {
  status?: AssetStatus;
}

// ==================== INITIAL STATE ====================

const initialState: AssetsState = {
  assets: [],
  currentAsset: null,
  filters: {
    search: '',
    type: 'ALL',
    status: 'ALL',
    location: null,
    maintenanceDue: false,
  },
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
};

// ==================== ASYNC THUNKS ====================

/**
 * Fetch all assets with optional filters
 */
export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/assets', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assets');
    }
  }
);

/**
 * Fetch single asset by ID
 */
export const fetchAssetById = createAsyncThunk(
  'assets/fetchAssetById',
  async (assetId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/assets/${assetId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asset');
    }
  }
);

/**
 * Create new asset
 */
export const createAsset = createAsyncThunk(
  'assets/createAsset',
  async (data: CreateAssetDto, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/assets', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create asset');
    }
  }
);

/**
 * Update existing asset
 */
export const updateAsset = createAsyncThunk(
  'assets/updateAsset',
  async ({ assetId, data }: { assetId: string; data: UpdateAssetDto }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/assets/${assetId}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update asset');
    }
  }
);

/**
 * Delete asset
 */
export const deleteAsset = createAsyncThunk(
  'assets/deleteAsset',
  async (assetId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/assets/${assetId}`);
      return assetId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete asset');
    }
  }
);

/**
 * Update asset status
 */
export const updateAssetStatus = createAsyncThunk(
  'assets/updateAssetStatus',
  async ({ assetId, status }: { assetId: string; status: AssetStatus }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/assets/${assetId}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update asset status');
    }
  }
);

/**
 * Fetch assets by type
 */
export const fetchAssetsByType = createAsyncThunk(
  'assets/fetchAssetsByType',
  async (type: AssetType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/assets/type/${type}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assets by type');
    }
  }
);

/**
 * Fetch maintenance due assets
 */
export const fetchMaintenanceDueAssets = createAsyncThunk(
  'assets/fetchMaintenanceDue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/assets/maintenance/due');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance due assets');
    }
  }
);

// ==================== SLICE ====================

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action: PayloadAction<Partial<AssetFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Clear current asset
    clearCurrentAsset: (state) => {
      state.currentAsset = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // WebSocket: Add asset realtime
    addAssetRealtime: (state, action: PayloadAction<Asset>) => {
      const exists = state.assets.find((a) => a.id === action.payload.id);
      if (!exists) {
        state.assets.unshift(action.payload);
        state.pagination.total += 1;
      }
    },

    // WebSocket: Update asset realtime
    updateAssetRealtime: (state, action: PayloadAction<Asset>) => {
      const index = state.assets.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.assets[index] = action.payload;
      }
      if (state.currentAsset?.id === action.payload.id) {
        state.currentAsset = action.payload;
      }
    },

    // WebSocket: Remove asset realtime
    removeAssetRealtime: (state, action: PayloadAction<string>) => {
      state.assets = state.assets.filter((a) => a.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.currentAsset?.id === action.payload) {
        state.currentAsset = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Assets
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload.data || action.payload;
        state.pagination = {
          total: action.payload.total || action.payload.length,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
        };
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Asset By ID
    builder
      .addCase(fetchAssetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAsset = action.payload;
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Asset
    builder
      .addCase(createAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assets.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Asset
    builder
      .addCase(updateAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.assets.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.assets[index] = action.payload;
        }
        if (state.currentAsset?.id === action.payload.id) {
          state.currentAsset = action.payload;
        }
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Asset
    builder
      .addCase(deleteAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = state.assets.filter((a) => a.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.currentAsset?.id === action.payload) {
          state.currentAsset = null;
        }
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Asset Status
    builder
      .addCase(updateAssetStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssetStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.assets.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.assets[index] = action.payload;
        }
        if (state.currentAsset?.id === action.payload.id) {
          state.currentAsset = action.payload;
        }
      })
      .addCase(updateAssetStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Assets By Type
    builder
      .addCase(fetchAssetsByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetsByType.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload;
      })
      .addCase(fetchAssetsByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Maintenance Due Assets
    builder
      .addCase(fetchMaintenanceDueAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceDueAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload;
      })
      .addCase(fetchMaintenanceDueAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  resetFilters,
  clearCurrentAsset,
  clearError,
  addAssetRealtime,
  updateAssetRealtime,
  removeAssetRealtime,
} = assetsSlice.actions;

export default assetsSlice.reducer;
