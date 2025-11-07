export declare enum ScenarioType {
    SHIP_DELAY = "SHIP_DELAY",
    ASSET_MAINTENANCE = "ASSET_MAINTENANCE",
    CUSTOM = "CUSTOM"
}
export declare enum SimulationStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class ScenarioChangeDto {
    entityType: 'ship_visit' | 'asset' | 'task';
    entityId: string;
    field: string;
    oldValue: any;
    newValue: any;
}
export declare class CreateSimulationDto {
    name: string;
    description?: string;
    baseScheduleId: string;
    scenarioType: ScenarioType;
    changes: ScenarioChangeDto[];
}
export declare class ConflictDetailDto {
    type: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    affectedTaskIds: string[];
    affectedResources: {
        assetId?: string;
        assetName?: string;
        assetType?: string;
    }[];
    timeRange?: {
        start: Date;
        end: Date;
    };
}
export declare class RecommendationDto {
    type: string;
    description: string;
    estimatedImpact: string;
    alternativeAssetId?: string;
    timeAdjustmentHours?: number;
    affectedTaskIds?: string[];
}
export declare class SimulationResultDto {
    id: string;
    name: string;
    status: SimulationStatus;
    baseScheduleId: string;
    resultScheduleId: string;
    scenarioType: ScenarioType;
    executionTimeMs: number;
    conflictsDetected: number;
    conflicts: ConflictDetailDto[];
    recommendations: RecommendationDto[];
    metrics: {
        totalTasks: number;
        affectedTasks: number;
        totalDelayHours: number;
        resourceUtilizationBefore: number;
        resourceUtilizationAfter: number;
    };
    startedAt: Date;
    completedAt: Date;
    createdAt: Date;
}
export declare class ShipDelayScenarioDto {
    shipVisitId: string;
    delayHours: number;
}
export declare class AssetMaintenanceScenarioDto {
    assetId: string;
    maintenanceStartTime: string;
    maintenanceDurationHours: number;
}
