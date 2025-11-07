import { Repository } from 'typeorm';
import { EventLog, EventType, EventSeverity } from './entities/event-log.entity';
import { CreateEventLogDto, EventLogFilterDto } from './dto/event-log.dto';
export declare class EventLogsService {
    private readonly eventLogRepository;
    constructor(eventLogRepository: Repository<EventLog>);
    createLog(createEventLogDto: CreateEventLogDto): Promise<EventLog>;
    logEvent(eventType: EventType, description: string, options?: {
        userId?: string;
        entityType?: string;
        entityId?: string;
        severity?: EventSeverity;
        metadata?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<EventLog>;
    findAll(filterDto?: EventLogFilterDto): Promise<EventLog[]>;
    findByEventType(eventType: EventType): Promise<EventLog[]>;
    findBySeverity(severity: EventSeverity): Promise<EventLog[]>;
    findByUser(userId: string): Promise<EventLog[]>;
    findByEntity(entityType: string, entityId: string): Promise<EventLog[]>;
    getRecentLogs(limit?: number): Promise<EventLog[]>;
    getStatistics(): Promise<any>;
    cleanOldLogs(daysToKeep?: number): Promise<number>;
}
