import axiosInstance from './axios.config';

// KPI Summary Response Types
export interface ShipKPIs {
  total: number;
  scheduled: number;
  berthing: number;
  loading: number;
  departing: number;
  delayed: number;
  averageBerthTime: number; // in hours
}

export interface TaskKPIs {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  completionRate: number; // percentage
  byType: {
    LOADING: number;
    UNLOADING: number;
    INSPECTION: number;
    MAINTENANCE: number;
  };
  byStatus: {
    PENDING: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    CANCELLED: number;
  };
}

export interface AssetKPIs {
  total: number;
  available: number;
  inUse: number;
  maintenance: number;
  utilizationRate: number; // percentage
  byType: {
    CRANE: number;
    FORKLIFT: number;
    TRUCK: number;
    CONTAINER: number;
  };
  byStatus: {
    AVAILABLE: number;
    IN_USE: number;
    MAINTENANCE: number;
    OUT_OF_SERVICE: number;
  };
}

export interface ScheduleKPIs {
  total: number;
  active: number;
  pending: number;
  completed: number;
  completionRate: number; // percentage
  conflictsDetected: number;
}

export interface KPISummary {
  ships: ShipKPIs;
  tasks: TaskKPIs;
  assets: AssetKPIs;
  schedules: ScheduleKPIs;
  lastUpdated: string;
}

// Chart Data Types
export interface ShipArrivalData {
  date: string;
  count: number;
  arrivals: number;
  departures: number;
}

export interface TaskStatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AssetUtilizationData {
  type: string;
  total: number;
  available: number;
  inUse: number;
  utilizationRate: number;
}

export interface ScheduleTimelineData {
  date: string;
  scheduled: number;
  active: number;
  completed: number;
}

// KPI API Service
export const kpiApi = {
  /**
   * Get comprehensive KPI summary
   */
  getSummary: async (): Promise<KPISummary> => {
    const response = await axiosInstance.get<KPISummary>('/kpis/summary');
    return response.data;
  },

  /**
   * Get ship arrivals data for chart
   */
  getShipArrivals: async (days: number = 7): Promise<ShipArrivalData[]> => {
    const response = await axiosInstance.get<ShipArrivalData[]>('/kpis/charts/ship-arrivals', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get task status breakdown for pie chart
   */
  getTaskStatus: async (): Promise<TaskStatusData[]> => {
    const response = await axiosInstance.get<TaskStatusData[]>('/kpis/charts/task-status');
    return response.data;
  },

  /**
   * Get asset utilization data for bar chart
   */
  getAssetUtilization: async (): Promise<AssetUtilizationData[]> => {
    const response = await axiosInstance.get<AssetUtilizationData[]>('/kpis/charts/asset-utilization');
    return response.data;
  },

  /**
   * Get schedule timeline data for area chart
   */
  getScheduleTimeline: async (days: number = 7): Promise<ScheduleTimelineData[]> => {
    const response = await axiosInstance.get<ScheduleTimelineData[]>('/kpis/charts/schedule-timeline', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Refresh all KPIs (force backend recalculation)
   */
  refresh: async (): Promise<void> => {
    await axiosInstance.post('/kpis/refresh');
  },
};

export default kpiApi;
