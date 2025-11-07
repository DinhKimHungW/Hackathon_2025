import { Conflict } from '../../conflicts/entities/conflict.entity';
export declare enum SimulationStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class SimulationRun {
    id: string;
    scenarioName: string;
    description: string;
    status: SimulationStatus;
    inputParameters: Record<string, any>;
    outputResults: Record<string, any>;
    startTime: Date;
    endTime: Date;
    executionTimeMs: number;
    conflictsDetected: number;
    utilizationRate: number;
    estimatedCost: number;
    createdBy: string;
    errorMessage: string;
    createdAt: Date;
    conflicts: Conflict[];
}
