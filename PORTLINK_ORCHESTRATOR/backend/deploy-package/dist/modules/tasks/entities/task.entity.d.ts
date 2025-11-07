import { Asset } from '../../assets/entities/asset.entity';
import { Schedule } from '../../schedules/entities/schedule.entity';
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
export declare class Task {
    id: string;
    scheduleId: string;
    assetId: string;
    taskName: string;
    taskType: TaskType;
    status: TaskStatus;
    startTime: Date;
    endTime: Date;
    priority: number;
    assignedTo: string;
    location: string;
    completionPercentage: number;
    actualStartTime: Date;
    actualEndTime: Date;
    estimatedDuration: number;
    actualDuration: number;
    metadata: Record<string, any>;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    schedule: Schedule;
    asset: Asset;
}
