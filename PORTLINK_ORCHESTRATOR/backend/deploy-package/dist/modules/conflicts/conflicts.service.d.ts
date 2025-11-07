import { Repository } from 'typeorm';
import { Conflict, ConflictSeverity, ConflictType } from './entities/conflict.entity';
import { CreateConflictDto } from './dto/create-conflict.dto';
import { UpdateConflictDto } from './dto/update-conflict.dto';
import { GetConflictsDto } from './dto/get-conflicts.dto';
import { ResolveConflictDto } from './dto/resolve-conflict.dto';
export declare class ConflictsService {
    private readonly conflictRepository;
    constructor(conflictRepository: Repository<Conflict>);
    create(createDto: CreateConflictDto): Promise<Conflict>;
    findAll(query: GetConflictsDto): Promise<{
        data: Conflict[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Conflict>;
    update(id: string, updateDto: UpdateConflictDto): Promise<Conflict>;
    resolve(id: string, resolveDto: ResolveConflictDto): Promise<Conflict>;
    remove(id: string): Promise<void>;
    getStats(simulationRunId?: string): Promise<{
        total: number;
        unresolved: number;
        critical: number;
        bySeverity: Record<ConflictSeverity, number>;
        byType: Record<ConflictType, number>;
    }>;
    getUnresolved(limit?: number, simulationRunId?: string): Promise<Conflict[]>;
}
