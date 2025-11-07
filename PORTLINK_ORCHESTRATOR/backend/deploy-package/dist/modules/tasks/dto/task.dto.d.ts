export declare enum TaskType {
    LOADING = "LOADING",
    UNLOADING = "UNLOADING",
    TRANSFER = "TRANSFER",
    INSPECTION = "INSPECTION",
    MAINTENANCE = "MAINTENANCE",
    OTHER = "OTHER"
}
export declare enum TaskStatus {
    PENDING = "PENDING",
    ASSIGNED = "ASSIGNED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED"
}
export declare class CreateTaskDto {
    taskName: string;
    taskType: TaskType;
    startTime: string;
    endTime: string;
    scheduleId?: string;
    assetId?: string;
    assignedTo?: string;
    estimatedDuration?: number;
    priority?: number;
    location?: string;
    notes?: string;
}
export declare class UpdateTaskDto {
    taskName?: string;
    taskType?: TaskType;
    status?: TaskStatus;
    startTime?: string;
    endTime?: string;
    scheduleId?: string;
    assetId?: string;
    assignedTo?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    priority?: number;
    completionPercentage?: number;
    actualStartTime?: string;
    actualEndTime?: string;
    location?: string;
    notes?: string;
}
export declare class TaskFilterDto {
    taskType?: TaskType;
    status?: TaskStatus;
    scheduleId?: string;
    assetId?: string;
    assignedTo?: string;
    search?: string;
}
