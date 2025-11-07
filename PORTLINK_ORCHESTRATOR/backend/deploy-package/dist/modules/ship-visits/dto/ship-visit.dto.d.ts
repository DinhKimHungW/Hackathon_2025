export declare enum ShipVisitStatus {
    PLANNED = "PLANNED",
    ARRIVED = "ARRIVED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    DEPARTED = "DEPARTED",
    CANCELLED = "CANCELLED"
}
export declare class CreateShipVisitDto {
    vesselName: string;
    vesselIMO: string;
    vesselType?: string;
    vesselLength?: number;
    vesselDraft?: number;
    cargo?: string;
    cargoVolume?: number;
    eta: Date;
    etd?: Date;
    berthAllocation?: string;
    agent?: string;
}
export declare class UpdateShipVisitDto {
    vesselName?: string;
    vesselIMO?: string;
    vesselType?: string;
    vesselLength?: number;
    vesselDraft?: number;
    cargo?: string;
    cargoVolume?: number;
    status?: ShipVisitStatus;
    eta?: Date;
    ata?: Date;
    etd?: Date;
    atd?: Date;
    berthAllocation?: string;
    agent?: string;
}
export declare class ShipVisitFilterDto {
    status?: ShipVisitStatus;
    vesselName?: string;
    vesselIMO?: string;
    berthAllocation?: string;
    fromDate?: Date;
    toDate?: Date;
}
