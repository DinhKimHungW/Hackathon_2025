import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Asset } from '../assets/entities/asset.entity';
import { ShipVisit } from '../ship-visits/entities/ship-visit.entity';
import { ConflictDetailDto } from './dto/simulation.dto';
export declare enum ConflictType {
    RESOURCE_DOUBLE_BOOKING = "RESOURCE_DOUBLE_BOOKING",
    CAPACITY_EXCEEDED = "CAPACITY_EXCEEDED",
    TIME_CONSTRAINT_VIOLATION = "TIME_CONSTRAINT_VIOLATION",
    DEPENDENCY_VIOLATION = "DEPENDENCY_VIOLATION"
}
export declare enum ConflictSeverity {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare class ConflictDetectionService {
    private taskRepository;
    private assetRepository;
    private shipVisitRepository;
    constructor(taskRepository: Repository<Task>, assetRepository: Repository<Asset>, shipVisitRepository: Repository<ShipVisit>);
    detectAllConflicts(scheduleId: string, tasks: Task[]): Promise<ConflictDetailDto[]>;
    private detectResourceDoubleBooking;
    private detectCapacityExceeded;
    private detectTimeConstraintViolations;
    private detectDependencyViolations;
    private isTimeOverlap;
    private calculateOverlapDuration;
    private calculateSeverity;
}
