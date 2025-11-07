import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { CreateAssetDto, UpdateAssetDto, AssetFilterDto, AssetStatus, AssetType } from './dto/asset.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const asset = this.assetRepository.create({
      ...createAssetDto,
      status: AssetStatus.AVAILABLE,
    });
    return await this.assetRepository.save(asset);
  }

  async findAll(filterDto?: AssetFilterDto): Promise<Asset[]> {
    const query = this.assetRepository.createQueryBuilder('asset');

    if (filterDto?.type) {
      query.andWhere('asset.type = :type', { type: filterDto.type });
    }

    if (filterDto?.status) {
      query.andWhere('asset.status = :status', { status: filterDto.status });
    }

    if (filterDto?.location) {
      query.andWhere('asset.location = :location', { location: filterDto.location });
    }

    if (filterDto?.search) {
      query.andWhere(
        '(asset.name ILIKE :search OR asset.model ILIKE :search)',
        { search: `%${filterDto.search}%` },
      );
    }

    query.orderBy('asset.name', 'ASC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async findByType(type: AssetType): Promise<Asset[]> {
    return await this.assetRepository.find({
      where: { type },
      order: { name: 'ASC' },
    });
  }

  async findByStatus(status: AssetStatus): Promise<Asset[]> {
    return await this.assetRepository.find({
      where: { status },
      order: { name: 'ASC' },
    });
  }

  async findAvailable(type?: AssetType): Promise<Asset[]> {
    const query = this.assetRepository.createQueryBuilder('asset')
      .where('asset.status = :status', { status: AssetStatus.AVAILABLE });

    if (type) {
      query.andWhere('asset.type = :type', { type });
    }

    query.orderBy('asset.name', 'ASC');

    return await query.getMany();
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.findOne(id);

    Object.assign(asset, updateAssetDto);

    return await this.assetRepository.save(asset);
  }

  async updateStatus(id: string, status: AssetStatus): Promise<Asset> {
    const asset = await this.findOne(id);

    asset.status = status;

    return await this.assetRepository.save(asset);
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findOne(id);
    await this.assetRepository.remove(asset);
  }

  async getStatistics(): Promise<any> {
    const total = await this.assetRepository.count();
    
    const byStatus = await this.assetRepository
      .createQueryBuilder('asset')
      .select('asset.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('asset.status')
      .getRawMany();

    const byType = await this.assetRepository
      .createQueryBuilder('asset')
      .select('asset.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('asset.type')
      .getRawMany();

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      byType: byType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }
}
