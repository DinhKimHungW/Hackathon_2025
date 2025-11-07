/**
 * Simulation Redux Slice
 * Manages simulation state, scenarios, and results
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import simulationApi from '@/api/simulation.api';
import type {
  CreateSimulationDto,
  SimulationResultDto,
} from '@/types/simulation.types';
import { SimulationStatus } from '@/types/simulation.types';
import type { RootState } from '@/store/store';

// ==================== STATE INTERFACE ====================

export interface SimulationState {
  // Current simulation being run
  currentSimulation: SimulationResultDto | null;
  
  // Recent simulations history
  recentSimulations: SimulationResultDto[];
  
  // Loading states
  loading: boolean;
  applying: boolean;
  
  // Error handling
  error: string | null;
  
  // Real-time progress (from WebSocket)
  progress: {
    status: SimulationStatus | null;
    message: string | null;
  };
}

// ==================== INITIAL STATE ====================

const initialState: SimulationState = {
  currentSimulation: null,
  recentSimulations: [],
  loading: false,
  applying: false,
  error: null,
  progress: {
    status: null,
    message: null,
  },
};

// ==================== ASYNC THUNKS ====================

/**
 * Run a new simulation
 */
export const runSimulation = createAsyncThunk(
  'simulation/run',
  async (dto: CreateSimulationDto, { rejectWithValue }) => {
    try {
      const result = await simulationApi.runSimulation(dto);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to run simulation');
    }
  }
);

/**
 * Fetch simulation result by ID
 */
export const fetchSimulationResult = createAsyncThunk(
  'simulation/fetchResult',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await simulationApi.getSimulation(id);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch simulation');
    }
  }
);

/**
 * Apply simulation (activate result schedule)
 */
export const applySimulation = createAsyncThunk(
  'simulation/apply',
  async (id: string, { rejectWithValue }) => {
    try {
      await simulationApi.applySimulation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply simulation');
    }
  }
);

/**
 * Delete simulation
 */
export const deleteSimulation = createAsyncThunk(
  'simulation/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await simulationApi.deleteSimulation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete simulation');
    }
  }
);

/**
 * Fetch recent simulations
 */
export const fetchRecentSimulations = createAsyncThunk(
  'simulation/fetchRecent',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const results = await simulationApi.listSimulations(limit);
      return results;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent simulations');
    }
  }
);

// ==================== SLICE ====================

const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    // Clear current simulation
    clearCurrentSimulation: (state) => {
      state.currentSimulation = null;
      state.error = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update progress from WebSocket
    updateProgress: (state, action: PayloadAction<{ status: SimulationStatus; message: string }>) => {
      state.progress = action.payload;
    },

    // Reset progress
    resetProgress: (state) => {
      state.progress = { status: null, message: null };
    },

    // Add simulation to recent list (from WebSocket event)
    addToRecentSimulations: (state, action: PayloadAction<SimulationResultDto>) => {
      state.recentSimulations = [action.payload, ...state.recentSimulations.slice(0, 9)];
    },
  },
  extraReducers: (builder) => {
    // Run Simulation
    builder
      .addCase(runSimulation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.progress = { status: SimulationStatus.PENDING, message: 'Starting simulation...' };
      })
      .addCase(runSimulation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSimulation = action.payload;
        state.progress = { status: SimulationStatus.COMPLETED, message: 'Simulation completed' };
        // Add to recent simulations
        state.recentSimulations = [action.payload, ...state.recentSimulations.slice(0, 9)];
      })
      .addCase(runSimulation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.progress = { status: SimulationStatus.FAILED, message: action.payload as string };
      });

    // Fetch Simulation Result
    builder
      .addCase(fetchSimulationResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimulationResult.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSimulation = action.payload;
      })
      .addCase(fetchSimulationResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Apply Simulation
    builder
      .addCase(applySimulation.pending, (state) => {
        state.applying = true;
        state.error = null;
      })
      .addCase(applySimulation.fulfilled, (state) => {
        state.applying = false;
        // Clear current simulation after applying
        state.currentSimulation = null;
      })
      .addCase(applySimulation.rejected, (state, action) => {
        state.applying = false;
        state.error = action.payload as string;
      });

    // Delete Simulation
    builder
      .addCase(deleteSimulation.fulfilled, (state, action) => {
        const deletedId = action.payload;
        // Remove from recent simulations
        state.recentSimulations = state.recentSimulations.filter((s) => s.id !== deletedId);
        // Clear current if it's the deleted one
        if (state.currentSimulation?.id === deletedId) {
          state.currentSimulation = null;
        }
      });

    // Fetch Recent Simulations
    builder
      .addCase(fetchRecentSimulations.fulfilled, (state, action) => {
        state.recentSimulations = action.payload;
      });
  },
});

// ==================== ACTIONS ====================

export const {
  clearCurrentSimulation,
  clearError,
  updateProgress,
  resetProgress,
  addToRecentSimulations,
} = simulationSlice.actions;

// ==================== SELECTORS ====================

export const selectCurrentSimulation = (state: RootState) => state.simulation.currentSimulation;
export const selectRecentSimulations = (state: RootState) => state.simulation.recentSimulations;
export const selectSimulationLoading = (state: RootState) => state.simulation.loading;
export const selectSimulationApplying = (state: RootState) => state.simulation.applying;
export const selectSimulationError = (state: RootState) => state.simulation.error;
export const selectSimulationProgress = (state: RootState) => state.simulation.progress;

// ==================== REDUCER ====================

export default simulationSlice.reducer;
