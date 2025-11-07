import { Task } from '../../tasks/entities/task.entity';
export declare enum AssetType {
    CRANE = "CRANE",
    TRUCK = "TRUCK",
    REACH_STACKER = "REACH_STACKER",
    FORKLIFT = "FORKLIFT",
    YARD_TRACTOR = "YARD_TRACTOR",
    OTHER = "OTHER"
}
export declare enum AssetStatus {
    AVAILABLE = "AVAILABLE",
    IN_USE = "IN_USE",
    MAINTENANCE = "MAINTENANCE",
    OFFLINE = "OFFLINE"
}
export declare class Asset {
    id: string;
    assetCode: string;
    name: string;
    type: AssetType;
    status: AssetStatus;
    capacity: number;
    capacityUnit: string;
    location: string;
    utilizationRate: number;
    specifications: Record<string, any>;
    lastMaintenanceDate: Date;
    nextMaintenanceDate: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    tasks: Task[];
}
