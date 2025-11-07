import { EventLog } from '../../event-logs/entities/event-log.entity';
export declare enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    OPERATIONS = "OPERATIONS",
    DRIVER = "DRIVER"
}
export declare class User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    fullName: string;
    isActive: boolean;
    avatar: string;
    phone: string;
    language: string;
    lastLogin: Date;
    permissions: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    eventLogs: EventLog[];
}
