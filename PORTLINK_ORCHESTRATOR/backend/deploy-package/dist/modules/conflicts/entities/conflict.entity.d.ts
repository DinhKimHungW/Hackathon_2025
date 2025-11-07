import { SimulationRun } from '../../simulation/entities/simulation-run.entity';
export declare enum ConflictType {
    RESOURCE_OVERLAP = "RESOURCE_OVERLAP",
    TIME_OVERLAP = "TIME_OVERLAP",
    LOCATION_OVERLAP = "LOCATION_OVERLAP",
    CAPACITY_EXCEEDED = "CAPACITY_EXCEEDED"
}
export declare enum ConflictSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare class Conflict {
    id: string;
    simulationRunId: string;
    conflictType: ConflictType;
    severity: ConflictSeverity;
    description: string;
    affectedResources: Record<string, any>;
    conflictTime: Date;
    suggestedResolution: Record<string, any>;
    resolved: boolean;
    resolutionNotes: string;
    createdAt: Date;
    simulationRun: SimulationRun;
}
