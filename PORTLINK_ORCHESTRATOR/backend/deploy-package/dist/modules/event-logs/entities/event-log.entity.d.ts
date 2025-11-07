import { User } from '../../users/entities/user.entity';
export declare enum EventType {
    USER_LOGIN = "USER_LOGIN",
    USER_LOGOUT = "USER_LOGOUT",
    ASSET_UPDATE = "ASSET_UPDATE",
    SCHEDULE_CREATE = "SCHEDULE_CREATE",
    SCHEDULE_UPDATE = "SCHEDULE_UPDATE",
    TASK_CREATE = "TASK_CREATE",
    TASK_UPDATE = "TASK_UPDATE",
    SIMULATION_START = "SIMULATION_START",
    SIMULATION_COMPLETE = "SIMULATION_COMPLETE",
    CONFLICT_DETECTED = "CONFLICT_DETECTED",
    CONFLICT_RESOLVED = "CONFLICT_RESOLVED",
    SYSTEM_ERROR = "SYSTEM_ERROR",
    DATA_EXPORT = "DATA_EXPORT",
    DATA_IMPORT = "DATA_IMPORT"
}
export declare enum EventSeverity {
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR",
    CRITICAL = "CRITICAL"
}
export declare class EventLog {
    id: string;
    eventType: EventType;
    severity: EventSeverity;
    userId: string;
    entityType: string;
    entityId: string;
    description: string;
    metadata: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    user: User;
}
