export declare enum AssetType {
    CRANE = "CRANE",
    REACH_STACKER = "REACH_STACKER",
    TRUCK = "TRUCK",
    YARD_TRACTOR = "YARD_TRACTOR",
    FORKLIFT = "FORKLIFT"
}
export declare enum AssetStatus {
    AVAILABLE = "AVAILABLE",
    IN_USE = "IN_USE",
    MAINTENANCE = "MAINTENANCE",
    OFFLINE = "OFFLINE"
}
export declare class CreateAssetDto {
    name: string;
    type: AssetType;
    model?: string;
    capacity?: number;
    location?: string;
    specifications?: any;
}
export declare class UpdateAssetDto {
    name?: string;
    type?: AssetType;
    status?: AssetStatus;
    model?: string;
    capacity?: number;
    location?: string;
    specifications?: any;
}
export declare class AssetFilterDto {
    type?: AssetType;
    status?: AssetStatus;
    location?: string;
    search?: string;
}
