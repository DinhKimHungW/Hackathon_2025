export declare enum ScheduleStatus {
    PENDING = "PENDING",
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class CreateScheduleDto {
    operation: string;
    startTime: Date;
    endTime: Date;
    shipVisitId?: string;
    priority?: number;
    location?: string;
    notes?: string;
}
export declare class UpdateScheduleDto {
    operation?: string;
    startTime?: Date;
    endTime?: Date;
    status?: ScheduleStatus;
    shipVisitId?: string;
    priority?: number;
    location?: string;
    notes?: string;
}
export declare class ScheduleFilterDto {
    status?: ScheduleStatus;
    shipVisitId?: string;
    operation?: string;
    fromDate?: Date;
    toDate?: Date;
    assignedTo?: string;
    onlyMine?: boolean;
}
