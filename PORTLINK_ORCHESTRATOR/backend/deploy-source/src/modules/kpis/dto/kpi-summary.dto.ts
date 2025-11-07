export class ShipKPIsDto {
  total: number;
  scheduled: number;
  berthing: number;
  loading: number;
  departing: number;
  delayed: number;
  averageBerthTime: number; // in hours
}

export class TaskKPIsDto {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  completionRate: number; // percentage
  byType: {
    LOADING: number;
    UNLOADING: number;
    MAINTENANCE: number;
    INSPECTION: number;
  };
  byStatus: {
    PENDING: number;
    ACTIVE: number;
    COMPLETED: number;
    CANCELLED: number;
  };
}

export class AssetKPIsDto {
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

export class ScheduleKPIsDto {
  total: number;
  active: number;
  pending: number;
  completed: number;
  completionRate: number; // percentage
  conflictsDetected: number;
}

export class KPISummaryDto {
  ships: ShipKPIsDto;
  tasks: TaskKPIsDto;
  assets: AssetKPIsDto;
  schedules: ScheduleKPIsDto;
  lastUpdated: Date;
}
