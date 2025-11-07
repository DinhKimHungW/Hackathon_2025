import { ShipVisit } from '../../ship-visits/entities/ship-visit.entity';
import { Task } from '../../tasks/entities/task.entity';
export declare enum ScheduleStatus {
    PENDING = "PENDING",
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class Schedule {
    id: string;
    shipVisitId: string;
    startTime: Date;
    endTime: Date;
    status: ScheduleStatus;
    priority: number;
    operation: string;
    completionPercentage: number;
    actualStartTime: Date;
    actualEndTime: Date;
    estimatedDuration: number;
    actualDuration: number;
    resources: Record<string, any>;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    shipVisit: ShipVisit;
    tasks: Task[];
}
