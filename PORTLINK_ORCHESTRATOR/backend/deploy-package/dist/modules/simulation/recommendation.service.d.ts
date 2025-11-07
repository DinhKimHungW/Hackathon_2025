import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Asset } from '../assets/entities/asset.entity';
import { ConflictDetailDto, RecommendationDto } from './dto/simulation.dto';
export declare class RecommendationService {
    private taskRepository;
    private assetRepository;
    constructor(taskRepository: Repository<Task>, assetRepository: Repository<Asset>);
    generateRecommendations(conflicts: ConflictDetailDto[], tasks: Task[]): Promise<RecommendationDto[]>;
    private resolveDoubleBooking;
    private resolveCapacityExceeded;
    private resolveTimeConstraint;
    private resolveDependencyViolation;
    private findAlternativeAsset;
    private findHigherCapacityAsset;
    private countDependentTasks;
}
