import { KpisService } from './kpis.service';
export declare class KpisController {
    private readonly kpisService;
    constructor(kpisService: KpisService);
    getSummary(): Promise<import("./dto/kpi-summary.dto").KPISummaryDto>;
    getShipArrivals(days?: string): Promise<import("./dto/chart-data.dto").ShipArrivalDataDto[]>;
    getTaskStatus(): Promise<import("./dto/chart-data.dto").TaskStatusDataDto[]>;
    getAssetUtilization(): Promise<import("./dto/chart-data.dto").AssetUtilizationDataDto[]>;
    getScheduleTimeline(days?: string): Promise<import("./dto/chart-data.dto").ScheduleTimelineDataDto[]>;
    refresh(): Promise<{
        message: string;
        timestamp: Date;
    }>;
}
