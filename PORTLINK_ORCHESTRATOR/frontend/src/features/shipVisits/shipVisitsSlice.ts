import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ShipVisitStatus = 
  | 'PLANNED' 
  | 'ARRIVED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'DEPARTED' 
  | 'CANCELLED';

export interface ShipVisit {
  id: string;
  shipName: string;
  imoNumber: string;
  vesselType: string;
  // Backwards-compatible alias used in several UI components
  shipType?: string;
  flag: string;
  grossTonnage: number;
  eta: string; // ISO datetime
  etd: string; // ISO datetime
  actualArrival?: string;
  actualDeparture?: string;
  berthId?: string;
  berthName?: string;
  // Backwards-compatible alias used in several UI components
  berth?: string;
  visitPurpose: string;
  status: ShipVisitStatus;
  agentCompany?: string;
  agentContact?: string;
  cargoType?: string;
  cargoQuantity?: number;
  cargoUnit?: string;
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ShipVisitStatistics {
  total: number;
  planned: number;
  arrived: number;
  inProgress: number;
  completed: number;
  departed: number;
  cancelled: number;
  averageBerthTime: number; // hours
}

export interface ShipVisitsFilters {
  status: ShipVisitStatus | 'ALL';
  search: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  portId: string | 'ALL';
}

// ============================================================================
// DATA NORMALIZATION HELPERS
// ============================================================================

type ShipVisitApiModel = {
  id?: string;
  vesselName?: string;
  vesselIMO?: string;
  voyageNumber?: string;
  eta?: string | Date | null;
  etd?: string | Date | null;
  ata?: string | Date | null;
  atd?: string | Date | null;
  status?: ShipVisitStatus;
  berthLocation?: string;
  totalContainers?: number;
  containersLoaded?: number;
  containersUnloaded?: number;
  completionPercentage?: number;
  shippingLine?: string;
  agent?: string;
  cargoDetails?: {
    type?: string;
    weight?: number | string;
    unit?: string;
    flag?: string;
    [key: string]: unknown;
  } | null;
  remarks?: string;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  [key: string]: unknown;
};

const MILLISECOND_IN_HOUR = 60 * 60 * 1000;

const toIsoString = (value: string | Date | null | undefined, fallback: string): string => {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? fallback : value.toISOString();
  }

  return fallback;
};

const safeString = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
};

const safeNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const optionalString = (value?: string | null): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
};

const optionalNumber = (value?: number | null): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return undefined;
};

const buildIsoHoursFromNow = (offsetHours: number): string => {
  return new Date(Date.now() + offsetHours * MILLISECOND_IN_HOUR).toISOString();
};

const normalizeShipVisit = (input: ShipVisit | ShipVisitApiModel | null | undefined): ShipVisit => {
  const fallbackNow = new Date().toISOString();
  const data = (input || {}) as ShipVisit & ShipVisitApiModel;

  const etaIso = toIsoString(data.eta ?? (data as ShipVisitApiModel).eta ?? null, fallbackNow);
  const etdIso = toIsoString(
    data.etd ?? (data as ShipVisitApiModel).etd ?? (data as ShipVisitApiModel).eta ?? null,
    etaIso,
  );

  const rawAta = data.actualArrival ?? (data as ShipVisitApiModel).ata ?? null;
  const rawAtd = data.actualDeparture ?? (data as ShipVisitApiModel).atd ?? null;
  const ataIso = rawAta ? toIsoString(rawAta, etaIso) : undefined;
  const atdIso = rawAtd ? toIsoString(rawAtd, etdIso) : undefined;

  const cargoDetails = (data as ShipVisitApiModel).cargoDetails || null;

  const cargoWeightSource = cargoDetails?.weight ?? data.cargoQuantity;
  const hasCargoWeight = cargoWeightSource !== undefined && cargoWeightSource !== null;

  return {
    id: data.id || safeString((input as ShipVisitApiModel)?.id, `fallback-${Math.random().toString(36).slice(2)}`),
    shipName: safeString(data.shipName ?? (data as ShipVisitApiModel).vesselName, 'Unknown Vessel'),
    imoNumber: safeString(data.imoNumber ?? (data as ShipVisitApiModel).vesselIMO, 'N/A'),
    vesselType:
      data.vesselType || cargoDetails?.type || 'General Cargo',
    flag: safeString(data.flag ?? cargoDetails?.flag, 'Unknown'),
    grossTonnage: safeNumber(data.grossTonnage ?? (hasCargoWeight ? cargoWeightSource : 0), 0),
    eta: etaIso,
    etd: etdIso,
    actualArrival: ataIso,
    actualDeparture: atdIso,
    berthId: data.berthId || (data as ShipVisitApiModel).berthLocation || data.berthName || undefined,
  berthName: safeString(data.berthName ?? (data as ShipVisitApiModel).berthLocation, 'Unassigned'),
  // compatibility aliases used by older UI components
  berth: safeString(data.berthName ?? (data as ShipVisitApiModel).berthLocation, 'Unassigned'),
  shipType: data.vesselType || cargoDetails?.type || 'General Cargo',
    visitPurpose: safeString(data.visitPurpose ?? (data as ShipVisitApiModel).remarks, 'General Operations'),
    status: (data.status as ShipVisitStatus) || 'PLANNED',
    agentCompany: safeString(data.agentCompany ?? (data as ShipVisitApiModel).agent, 'Not Assigned'),
    agentContact: safeString(data.agentContact, 'N/A'),
    cargoType: safeString(data.cargoType ?? cargoDetails?.type, 'General Cargo'),
    cargoQuantity: hasCargoWeight ? safeNumber(cargoWeightSource, 0) : null,
    cargoUnit: safeString(
      data.cargoUnit ?? (cargoDetails?.unit as string),
      hasCargoWeight ? 'tons' : 'N/A',
    ),
    specialNotes: safeString(data.specialNotes ?? (data as ShipVisitApiModel).remarks, ''),
    createdAt: toIsoString(data.createdAt ?? (data as ShipVisitApiModel).createdAt ?? null, fallbackNow),
    updatedAt: toIsoString(data.updatedAt ?? (data as ShipVisitApiModel).updatedAt ?? null, fallbackNow),
    createdBy: safeString(data.createdBy, 'System'),
  };
};

const normalizeShipVisitList = (payload: unknown): ShipVisit[] => {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeShipVisit(item));
  }

  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return ((payload as { data?: unknown }).data as unknown[]).map((item) => normalizeShipVisit(item));
  }

  return [];
};

const createFallbackShipVisits = (): ShipVisit[] => {
  return [
    {
      id: 'fallback-ship-1',
      shipName: 'MV Ocean Star',
      imoNumber: 'IMO9876543',
      vesselType: 'Container Ship',
      flag: 'Singapore',
      grossTonnage: 15000,
      eta: buildIsoHoursFromNow(-2),
      etd: buildIsoHoursFromNow(46),
      actualArrival: buildIsoHoursFromNow(-1),
      actualDeparture: undefined,
      berthId: 'B-01',
      berthName: 'B-01',
      visitPurpose: 'Priority unloading operations',
      status: 'IN_PROGRESS',
      agentCompany: 'Port Services Inc',
      agentContact: 'ops@portservices.test',
      cargoType: 'Containers',
      cargoQuantity: 15000,
      cargoUnit: 'tons',
      specialNotes: 'High priority vessel - scheduled unloading operations',
      createdAt: buildIsoHoursFromNow(-4),
      updatedAt: buildIsoHoursFromNow(-1),
      createdBy: 'System',
    },
    {
      id: 'fallback-ship-2',
      shipName: 'MV Pacific Pearl',
      imoNumber: 'IMO9876544',
      vesselType: 'Container Ship',
      flag: 'Panama',
      grossTonnage: 12500,
      eta: buildIsoHoursFromNow(-4),
      etd: buildIsoHoursFromNow(24),
      actualArrival: buildIsoHoursFromNow(-3),
      actualDeparture: undefined,
      berthId: 'B-02',
      berthName: 'B-02',
      visitPurpose: 'Container discharge and loading',
      status: 'IN_PROGRESS',
      agentCompany: 'Marine Logistics Ltd',
      agentContact: 'contact@marinelogistics.test',
      cargoType: 'Containers',
      cargoQuantity: 12500,
      cargoUnit: 'tons',
      specialNotes: 'Real-time monitoring enabled',
      createdAt: buildIsoHoursFromNow(-6),
      updatedAt: buildIsoHoursFromNow(-2),
      createdBy: 'System',
    },
    {
      id: 'fallback-ship-3',
      shipName: 'MV Atlantic Queen',
      imoNumber: 'IMO9876545',
      vesselType: 'Bulk Carrier',
      flag: 'Liberia',
      grossTonnage: 25000,
      eta: buildIsoHoursFromNow(-0.5),
      etd: buildIsoHoursFromNow(72),
      actualArrival: buildIsoHoursFromNow(-0.25),
      actualDeparture: undefined,
      berthId: 'B-03',
      berthName: 'B-03',
      visitPurpose: 'Bulk grain discharge',
      status: 'ARRIVED',
      agentCompany: 'Ocean Freight Co',
      agentContact: 'support@oceanfreight.test',
      cargoType: 'Bulk Grain',
      cargoQuantity: 25000,
      cargoUnit: 'tons',
      specialNotes: 'Requires special handling procedures',
      createdAt: buildIsoHoursFromNow(-1),
      updatedAt: buildIsoHoursFromNow(-0.2),
      createdBy: 'System',
    },
    {
      id: 'fallback-ship-4',
      shipName: 'MV Baltic Breeze',
      imoNumber: 'IMO9876546',
      vesselType: 'Container Ship',
      flag: 'Denmark',
      grossTonnage: 18000,
      eta: buildIsoHoursFromNow(6),
      etd: buildIsoHoursFromNow(96),
      actualArrival: undefined,
      actualDeparture: undefined,
      berthId: 'B-04',
      berthName: 'B-04',
      visitPurpose: 'Upcoming arrival',
      status: 'PLANNED',
      agentCompany: 'Coastal Shipping',
      agentContact: 'desk@coastalshipping.test',
      cargoType: 'Containers',
      cargoQuantity: 18000,
      cargoUnit: 'tons',
      specialNotes: 'ETA confirmation pending',
      createdAt: buildIsoHoursFromNow(-0.1),
      updatedAt: buildIsoHoursFromNow(-0.05),
      createdBy: 'System',
    },
  ];
};

const getFallbackShipVisits = (): ShipVisit[] => createFallbackShipVisits();

const adaptCreateShipVisitPayload = (data: Partial<ShipVisit>): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    vesselName: optionalString(data.shipName) ?? 'Unnamed Vessel',
    vesselIMO: optionalString(data.imoNumber),
    vesselType: optionalString(data.vesselType),
    cargo: optionalString(data.cargoType) ?? optionalString(data.visitPurpose),
    cargoVolume: optionalNumber(data.cargoQuantity),
    eta: optionalString(data.eta) ?? new Date().toISOString(),
    etd: optionalString(data.etd),
    berthAllocation: optionalString(data.berthName ?? data.berthId),
    agent: optionalString(data.agentCompany),
  };

  if (!payload.vesselIMO) {
    delete payload.vesselIMO;
  }
  if (!payload.vesselType) {
    delete payload.vesselType;
  }
  if (!payload.cargo) {
    delete payload.cargo;
  }
  if ((payload.cargoVolume as number | undefined) === undefined) {
    delete payload.cargoVolume;
  }
  if (!payload.etd) {
    delete payload.etd;
  }
  if (!payload.berthAllocation) {
    delete payload.berthAllocation;
  }
  if (!payload.agent) {
    delete payload.agent;
  }

  return payload;
};

const adaptUpdateShipVisitPayload = (data: Partial<ShipVisit>): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    ...adaptCreateShipVisitPayload(data),
    status: data.status,
    eta: optionalString(data.eta) ?? new Date().toISOString(),
    etd: optionalString(data.etd),
  };

  const ata = optionalString(data.actualArrival);
  const atd = optionalString(data.actualDeparture);

  if (ata) {
    payload.ata = ata;
  }
  if (atd) {
    payload.atd = atd;
  }
  if (!payload.status) {
    delete payload.status;
  }
  if (!payload.etd) {
    delete payload.etd;
  }

  return payload;
};

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ShipVisitsState {
  shipVisits: ShipVisit[];
  currentShipVisit: ShipVisit | null;
  filters: ShipVisitsFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  statistics: ShipVisitStatistics | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ShipVisitsState = {
  shipVisits: [],
  currentShipVisit: null,
  filters: {
    status: 'ALL',
    search: '',
    dateRange: {
      start: null,
      end: null,
    },
    portId: 'ALL',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  statistics: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

const SHIP_VISITS_ENDPOINT = '/ship-visits';

// Fetch ship visits with filters and pagination
export const fetchShipVisits = createAsyncThunk(
  'shipVisits/fetchShipVisits',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const { filters } = state.shipVisits;

      const params: Record<string, string> = {};

      if (filters.status !== 'ALL') {
        params.status = filters.status;
      }

      if (filters.search) {
        params.vesselName = filters.search;
      }

      if (filters.dateRange.start) {
        params.fromDate = filters.dateRange.start.toISOString();
      }

      if (filters.dateRange.end) {
        params.toDate = filters.dateRange.end.toISOString();
      }

      const response = await axiosInstance.get(SHIP_VISITS_ENDPOINT, {
        params,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ship visits');
    }
  }
);

// Fetch single ship visit by ID
export const fetchShipVisitById = createAsyncThunk(
  'shipVisits/fetchShipVisitById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${SHIP_VISITS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ship visit');
    }
  }
);

// Create new ship visit
export const createShipVisit = createAsyncThunk(
  'shipVisits/createShipVisit',
  async (data: Partial<ShipVisit>, { rejectWithValue }) => {
    try {
      const payload = adaptCreateShipVisitPayload(data);
      const response = await axiosInstance.post(SHIP_VISITS_ENDPOINT, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create ship visit');
    }
  }
);

// Update ship visit
export const updateShipVisit = createAsyncThunk(
  'shipVisits/updateShipVisit',
  async ({ id, data }: { id: string; data: Partial<ShipVisit> }, { rejectWithValue }) => {
    try {
      const payload = adaptUpdateShipVisitPayload(data);
      const response = await axiosInstance.patch(`${SHIP_VISITS_ENDPOINT}/${id}`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update ship visit');
    }
  }
);

// Delete ship visit
export const deleteShipVisit = createAsyncThunk(
  'shipVisits/deleteShipVisit',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${SHIP_VISITS_ENDPOINT}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete ship visit');
    }
  }
);

// Update ship visit status
export const updateShipVisitStatus = createAsyncThunk(
  'shipVisits/updateShipVisitStatus',
  async ({ id, status }: { id: string; status: ShipVisitStatus }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${SHIP_VISITS_ENDPOINT}/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

// Record ship arrival
export const recordArrival = createAsyncThunk(
  'shipVisits/recordArrival',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${SHIP_VISITS_ENDPOINT}/${id}/arrival`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record arrival');
    }
  }
);

// Record ship departure
export const recordDeparture = createAsyncThunk(
  'shipVisits/recordDeparture',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${SHIP_VISITS_ENDPOINT}/${id}/departure`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record departure');
    }
  }
);

// Fetch ship visit statistics
export const fetchStatistics = createAsyncThunk(
  'shipVisits/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${SHIP_VISITS_ENDPOINT}/statistics`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const shipVisitsSlice = createSlice({
  name: 'shipVisits',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action: PayloadAction<Partial<ShipVisitsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Real-time update from WebSocket
    updateShipVisitRealtime: (state, action: PayloadAction<ShipVisit | ShipVisitApiModel>) => {
      const updatedShipVisit = normalizeShipVisit(action.payload);
      const index = state.shipVisits.findIndex((sv) => sv.id === updatedShipVisit.id);
      if (index !== -1) {
        state.shipVisits[index] = updatedShipVisit;
      } else {
        state.shipVisits.unshift(updatedShipVisit);
      }

      state.pagination.total = state.shipVisits.length;
      state.pagination.totalPages = Math.max(1, Math.ceil(state.pagination.total / state.pagination.limit));

      // Update current ship visit if it's the same one
      if (state.currentShipVisit?.id === updatedShipVisit.id) {
        state.currentShipVisit = updatedShipVisit;
      }
    },

    // Add ship visit (for WebSocket create event)
    addShipVisit: (state, action: PayloadAction<ShipVisit | ShipVisitApiModel>) => {
      const newShipVisit = normalizeShipVisit(action.payload);
      state.shipVisits.unshift(newShipVisit);
      state.pagination.total = state.shipVisits.length;
      state.pagination.totalPages = Math.max(1, Math.ceil(state.pagination.total / state.pagination.limit));
    },

    // Remove ship visit (for WebSocket delete event)
    removeShipVisit: (state, action: PayloadAction<string>) => {
      state.shipVisits = state.shipVisits.filter(sv => sv.id !== action.payload);
      state.pagination.total = state.shipVisits.length;
      state.pagination.totalPages = Math.max(1, Math.ceil(state.pagination.total / state.pagination.limit));

      if (state.currentShipVisit?.id === action.payload) {
        state.currentShipVisit = null;
      }
    },

    // Clear current ship visit
    clearCurrentShipVisit: (state) => {
      state.currentShipVisit = null;
    },
  },

  extraReducers: (builder) => {
    // Fetch ship visits
    builder.addCase(fetchShipVisits.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchShipVisits.fulfilled, (state, action) => {
      state.loading = false;
      const rawList = Array.isArray(action.payload)
        ? action.payload
        : Array.isArray((action.payload as { data?: unknown[] })?.data)
          ? (action.payload as { data: unknown[] }).data
          : null;

      const normalized = normalizeShipVisitList(action.payload);
      const shouldUseFallback = rawList === null && normalized.length === 0;

      state.shipVisits = shouldUseFallback ? getFallbackShipVisits() : normalized;

      const totalFromPayload = (action.payload as { total?: number })?.total;
      state.pagination.total = typeof totalFromPayload === 'number' && totalFromPayload >= 0
        ? totalFromPayload
        : state.shipVisits.length;

      state.pagination.totalPages = Math.max(1, Math.ceil(state.pagination.total / state.pagination.limit));
      state.error = null;
    });
    builder.addCase(fetchShipVisits.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.shipVisits = getFallbackShipVisits();
      state.pagination.total = state.shipVisits.length;
      state.pagination.totalPages = Math.max(1, Math.ceil(state.pagination.total / state.pagination.limit));
    });

    // Fetch ship visit by ID
    builder.addCase(fetchShipVisitById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchShipVisitById.fulfilled, (state, action) => {
      state.loading = false;
      const normalized = normalizeShipVisit((action.payload as { data?: unknown })?.data ?? action.payload);
      state.currentShipVisit = normalized;
      state.error = null;
    });
    builder.addCase(fetchShipVisitById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      const fallbackList = getFallbackShipVisits();
      state.currentShipVisit = fallbackList.length ? fallbackList[0] : null;
    });

    // Create ship visit
    builder.addCase(createShipVisit.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createShipVisit.fulfilled, (state, action) => {
      state.loading = false;
      const created = normalizeShipVisit((action.payload as { data?: unknown })?.data ?? action.payload);
      state.shipVisits.unshift(created);
      state.pagination.total = state.shipVisits.length;
      state.pagination.totalPages = Math.max(1, Math.ceil(state.pagination.total / state.pagination.limit));
      state.error = null;
    });
    builder.addCase(createShipVisit.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update ship visit
    builder.addCase(updateShipVisit.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateShipVisit.fulfilled, (state, action) => {
      state.loading = false;
      const updated = normalizeShipVisit((action.payload as { data?: unknown })?.data ?? action.payload);
      const index = state.shipVisits.findIndex(sv => sv.id === updated.id);
      if (index !== -1) {
        state.shipVisits[index] = updated;
      }
      if (state.currentShipVisit?.id === updated.id) {
        state.currentShipVisit = updated;
      }
      state.error = null;
    });
    builder.addCase(updateShipVisit.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete ship visit
    builder.addCase(deleteShipVisit.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteShipVisit.fulfilled, (state, action) => {
      state.loading = false;
      state.shipVisits = state.shipVisits.filter(sv => sv.id !== action.payload);
      state.pagination.total = state.shipVisits.length;
      state.pagination.totalPages = Math.max(1, Math.ceil(state.pagination.total / state.pagination.limit));
      if (state.currentShipVisit?.id === action.payload) {
        state.currentShipVisit = null;
      }
      state.error = null;
    });
    builder.addCase(deleteShipVisit.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update status
    builder.addCase(updateShipVisitStatus.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateShipVisitStatus.fulfilled, (state, action) => {
      state.loading = false;
      const updated = normalizeShipVisit((action.payload as { data?: unknown })?.data ?? action.payload);
      const index = state.shipVisits.findIndex(sv => sv.id === updated.id);
      if (index !== -1) {
        state.shipVisits[index] = updated;
      }
      if (state.currentShipVisit?.id === updated.id) {
        state.currentShipVisit = updated;
      }
      state.error = null;
    });
    builder.addCase(updateShipVisitStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Record arrival
    builder.addCase(recordArrival.fulfilled, (state, action) => {
      const updated = normalizeShipVisit((action.payload as { data?: unknown })?.data ?? action.payload);
      const index = state.shipVisits.findIndex(sv => sv.id === updated.id);
      if (index !== -1) {
        state.shipVisits[index] = updated;
      }
      if (state.currentShipVisit?.id === updated.id) {
        state.currentShipVisit = updated;
      }
      state.error = null;
    });

    // Record departure
    builder.addCase(recordDeparture.fulfilled, (state, action) => {
      const updated = normalizeShipVisit((action.payload as { data?: unknown })?.data ?? action.payload);
      const index = state.shipVisits.findIndex(sv => sv.id === updated.id);
      if (index !== -1) {
        state.shipVisits[index] = updated;
      }
      if (state.currentShipVisit?.id === updated.id) {
        state.currentShipVisit = updated;
      }
      state.error = null;
    });

    // Fetch statistics
    builder.addCase(fetchStatistics.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchStatistics.fulfilled, (state, action) => {
      state.loading = false;
      state.statistics = action.payload.data || action.payload;
      state.error = null;
    });
    builder.addCase(fetchStatistics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// ============================================================================
// ACTIONS
// ============================================================================

export const {
  setFilters,
  setPagination,
  clearError,
  updateShipVisitRealtime,
  addShipVisit,
  removeShipVisit,
  clearCurrentShipVisit,
} = shipVisitsSlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================

export const selectShipVisits = (state: any) => state.shipVisits.shipVisits;
export const selectCurrentShipVisit = (state: any) => state.shipVisits.currentShipVisit;
export const selectShipVisitsLoading = (state: any) => state.shipVisits.loading;
export const selectShipVisitsError = (state: any) => state.shipVisits.error;
export const selectShipVisitsFilters = (state: any) => state.shipVisits.filters;
export const selectShipVisitsPagination = (state: any) => state.shipVisits.pagination;
export const selectShipVisitStatistics = (state: any) => state.shipVisits.statistics;

// ============================================================================
// REDUCER
// ============================================================================

export default shipVisitsSlice.reducer;
