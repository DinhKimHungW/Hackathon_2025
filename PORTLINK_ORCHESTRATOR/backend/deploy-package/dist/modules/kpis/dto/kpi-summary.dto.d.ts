export declare class ShipKPIsDto {
    total: number;
    scheduled: number;
    berthing: number;
    loading: number;
    departing: number;
    delayed: number;
    averageBerthTime: number;
}
export declare class TaskKPIsDto {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    completionRate: number;
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
export declare class AssetKPIsDto {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    utilizationRate: number;
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
export declare class ScheduleKPIsDto {
    total: number;
    active: number;
    pending: number;
    completed: number;
    completionRate: number;
    conflictsDetected: number;
}
export declare class KPISummaryDto {
    ships: ShipKPIsDto;
    tasks: TaskKPIsDto;
    assets: AssetKPIsDto;
    schedules: ScheduleKPIsDto;
    lastUpdated: Date;
}
