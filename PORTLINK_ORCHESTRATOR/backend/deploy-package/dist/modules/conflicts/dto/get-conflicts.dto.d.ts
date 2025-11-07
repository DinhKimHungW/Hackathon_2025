import { ConflictSeverity, ConflictType } from '../entities/conflict.entity';
export declare class GetConflictsDto {
    page: number;
    limit: number;
    conflictType?: ConflictType | 'ALL';
    severity?: ConflictSeverity | 'ALL';
    resolved?: 'ALL' | 'RESOLVED' | 'UNRESOLVED';
    simulationRunId?: string;
    search?: string;
}
