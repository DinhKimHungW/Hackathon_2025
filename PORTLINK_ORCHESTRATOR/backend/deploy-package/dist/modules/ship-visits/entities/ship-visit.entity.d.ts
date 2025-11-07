import { Schedule } from '../../schedules/entities/schedule.entity';
export declare enum ShipVisitStatus {
    PLANNED = "PLANNED",
    ARRIVED = "ARRIVED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    DEPARTED = "DEPARTED",
    CANCELLED = "CANCELLED"
}
export declare class ShipVisit {
    id: string;
    vesselName: string;
    vesselIMO: string;
    voyageNumber: string;
    eta: Date;
    etd: Date;
    ata: Date;
    atd: Date;
    status: ShipVisitStatus;
    berthLocation: string;
    totalContainers: number;
    containersLoaded: number;
    containersUnloaded: number;
    completionPercentage: number;
    shippingLine: string;
    agent: string;
    cargoDetails: Record<string, any>;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
    schedules: Schedule[];
}
