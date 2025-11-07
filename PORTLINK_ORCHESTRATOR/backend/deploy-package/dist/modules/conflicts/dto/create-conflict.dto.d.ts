import { ConflictSeverity, ConflictType } from '../entities/conflict.entity';
export declare class CreateConflictDto {
    simulationRunId: string;
    conflictType: ConflictType;
    severity: ConflictSeverity;
    description: string;
    affectedResources: Record<string, any>;
    conflictTime: string;
    suggestedResolution?: Record<string, any>;
    resolved?: boolean;
    resolutionNotes?: string;
}
