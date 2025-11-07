import { EventType, EventSeverity } from '../entities/event-log.entity';
export declare class CreateEventLogDto {
    eventType: EventType;
    severity?: EventSeverity;
    userId?: string;
    entityType?: string;
    entityId?: string;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export declare class EventLogFilterDto {
    eventType?: EventType;
    severity?: EventSeverity;
    userId?: string;
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}
