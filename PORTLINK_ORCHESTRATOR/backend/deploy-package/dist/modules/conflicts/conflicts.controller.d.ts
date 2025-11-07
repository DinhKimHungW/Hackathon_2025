import { ConflictsService } from './conflicts.service';
import { CreateConflictDto } from './dto/create-conflict.dto';
import { UpdateConflictDto } from './dto/update-conflict.dto';
import { GetConflictsDto } from './dto/get-conflicts.dto';
import { ResolveConflictDto } from './dto/resolve-conflict.dto';
export declare class ConflictsController {
    private readonly conflictsService;
    constructor(conflictsService: ConflictsService);
    create(createConflictDto: CreateConflictDto): Promise<import("./entities/conflict.entity").Conflict>;
    findAll(query: GetConflictsDto): Promise<{
        data: import("./entities/conflict.entity").Conflict[];
        total: number;
        page: number;
        limit: number;
    }>;
    stats(simulationRunId?: string): Promise<{
        total: number;
        unresolved: number;
        critical: number;
        bySeverity: Record<import("./entities/conflict.entity").ConflictSeverity, number>;
        byType: Record<import("./entities/conflict.entity").ConflictType, number>;
    }>;
    unresolved(limit?: string, simulationRunId?: string): Promise<import("./entities/conflict.entity").Conflict[]>;
    findOne(id: string): Promise<import("./entities/conflict.entity").Conflict>;
    update(id: string, updateConflictDto: UpdateConflictDto): Promise<import("./entities/conflict.entity").Conflict>;
    resolve(id: string, resolveDto: ResolveConflictDto): Promise<import("./entities/conflict.entity").Conflict>;
    remove(id: string): Promise<void>;
}
