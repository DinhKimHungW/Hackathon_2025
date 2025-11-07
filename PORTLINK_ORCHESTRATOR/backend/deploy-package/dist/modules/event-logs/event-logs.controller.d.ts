import { EventLogsService } from './event-logs.service';
import { EventLogFilterDto } from './dto/event-log.dto';
import { EventType, EventSeverity } from './entities/event-log.entity';
export declare class EventLogsController {
    private readonly eventLogsService;
    constructor(eventLogsService: EventLogsService);
    findAll(filterDto: EventLogFilterDto): Promise<import("./entities/event-log.entity").EventLog[]>;
    getStatistics(): Promise<any>;
    getRecentLogs(limit?: number): Promise<import("./entities/event-log.entity").EventLog[]>;
    findByEventType(eventType: EventType): Promise<import("./entities/event-log.entity").EventLog[]>;
    findBySeverity(severity: EventSeverity): Promise<import("./entities/event-log.entity").EventLog[]>;
    findByUser(userId: string): Promise<import("./entities/event-log.entity").EventLog[]>;
    findByEntity(entityType: string, entityId: string): Promise<import("./entities/event-log.entity").EventLog[]>;
    cleanOldLogs(daysToKeep?: number): Promise<number>;
}
