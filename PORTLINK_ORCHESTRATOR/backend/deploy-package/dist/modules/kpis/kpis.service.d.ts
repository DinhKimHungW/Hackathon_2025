import { Repository } from 'typeorm';
import { ShipVisit } from '../ship-visits/entities/ship-visit.entity';
import { Task } from '../tasks/entities/task.entity';
import { Asset } from '../assets/entities/asset.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { KPISummaryDto } from './dto/kpi-summary.dto';
import { ShipArrivalDataDto, TaskStatusDataDto, AssetUtilizationDataDto, ScheduleTimelineDataDto } from './dto/chart-data.dto';
export declare class KpisService {
    private shipVisitRepository;
    private taskRepository;
    private assetRepository;
    private scheduleRepository;
    constructor(shipVisitRepository: Repository<ShipVisit>, taskRepository: Repository<Task>, assetRepository: Repository<Asset>, scheduleRepository: Repository<Schedule>);
    getSummary(): Promise<KPISummaryDto>;
    private getShipKPIs;
    private getTaskKPIs;
    private getAssetKPIs;
    private getScheduleKPIs;
    getShipArrivals(days?: number): Promise<ShipArrivalDataDto[]>;
    getTaskStatus(): Promise<TaskStatusDataDto[]>;
    getAssetUtilization(): Promise<AssetUtilizationDataDto[]>;
    getScheduleTimeline(days?: number): Promise<ScheduleTimelineDataDto[]>;
    refresh(): Promise<{
        message: string;
        timestamp: Date;
    }>;
}
