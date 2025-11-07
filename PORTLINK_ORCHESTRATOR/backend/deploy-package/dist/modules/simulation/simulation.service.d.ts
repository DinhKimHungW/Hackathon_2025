import { Repository, DataSource } from 'typeorm';
import { Cache } from 'cache-manager';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Task } from '../tasks/entities/task.entity';
import { Asset } from '../assets/entities/asset.entity';
import { ShipVisit } from '../ship-visits/entities/ship-visit.entity';
import { ConflictDetectionService } from './conflict-detection.service';
import { RecommendationService } from './recommendation.service';
import { WebSocketEventsGateway } from '../websocket/websocket.gateway';
import { CreateSimulationDto, SimulationResultDto } from './dto/simulation.dto';
export declare class SimulationService {
    private scheduleRepository;
    private taskRepository;
    private assetRepository;
    private shipVisitRepository;
    private dataSource;
    private conflictDetectionService;
    private recommendationService;
    private websocketGateway;
    private cacheManager;
    constructor(scheduleRepository: Repository<Schedule>, taskRepository: Repository<Task>, assetRepository: Repository<Asset>, shipVisitRepository: Repository<ShipVisit>, dataSource: DataSource, conflictDetectionService: ConflictDetectionService, recommendationService: RecommendationService, websocketGateway: WebSocketEventsGateway, cacheManager: Cache);
    runSimulation(dto: CreateSimulationDto): Promise<SimulationResultDto>;
    private cloneSchedule;
    private applyScenarioChanges;
    private applyShipDelayScenario;
    private applyAssetMaintenanceScenario;
    private applyCustomScenario;
    private recalculateSchedule;
    private detectConflicts;
    private generateRecommendations;
    private calculateMetrics;
    getSimulationResult(simulationId: string): Promise<SimulationResultDto>;
    applySimulation(simulationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listRecentSimulations(limit?: number): Promise<SimulationResultDto[]>;
    deleteSimulation(simulationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private extractSimulationMetadata;
    private buildSimulationResultFromSchedule;
}
