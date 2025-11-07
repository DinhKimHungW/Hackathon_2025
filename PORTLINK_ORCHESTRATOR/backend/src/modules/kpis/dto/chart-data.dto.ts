export class ShipArrivalDataDto {
  date: string;
  count: number;
  arrivals: number;
  departures: number;
}

export class TaskStatusDataDto {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export class AssetUtilizationDataDto {
  type: string;
  total: number;
  available: number;
  inUse: number;
  utilizationRate: number;
}

export class ScheduleTimelineDataDto {
  date: string;
  scheduled: number;
  active: number;
  completed: number;
}
