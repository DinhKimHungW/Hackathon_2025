import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { CreateAssetDto, UpdateAssetDto, AssetFilterDto, AssetStatus, AssetType } from './dto/asset.dto';
export declare class AssetsService {
    private readonly assetRepository;
    constructor(assetRepository: Repository<Asset>);
    create(createAssetDto: CreateAssetDto): Promise<Asset>;
    findAll(filterDto?: AssetFilterDto): Promise<Asset[]>;
    findOne(id: string): Promise<Asset>;
    findByType(type: AssetType): Promise<Asset[]>;
    findByStatus(status: AssetStatus): Promise<Asset[]>;
    findAvailable(type?: AssetType): Promise<Asset[]>;
    update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset>;
    updateStatus(id: string, status: AssetStatus): Promise<Asset>;
    remove(id: string): Promise<void>;
    getStatistics(): Promise<any>;
}
