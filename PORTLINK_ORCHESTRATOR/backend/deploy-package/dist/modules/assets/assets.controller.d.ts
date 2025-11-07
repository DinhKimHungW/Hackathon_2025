import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, AssetFilterDto, AssetStatus, AssetType } from './dto/asset.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    create(createAssetDto: CreateAssetDto): Promise<import("./entities/asset.entity").Asset>;
    findAll(filterDto: AssetFilterDto): Promise<import("./entities/asset.entity").Asset[]>;
    getStatistics(): Promise<any>;
    findAvailable(type?: AssetType): Promise<import("./entities/asset.entity").Asset[]>;
    findByType(type: AssetType): Promise<import("./entities/asset.entity").Asset[]>;
    findByStatus(status: AssetStatus): Promise<import("./entities/asset.entity").Asset[]>;
    findOne(id: string): Promise<import("./entities/asset.entity").Asset>;
    update(id: string, updateAssetDto: UpdateAssetDto): Promise<import("./entities/asset.entity").Asset>;
    updateStatus(id: string, status: AssetStatus): Promise<import("./entities/asset.entity").Asset>;
    remove(id: string): Promise<void>;
}
