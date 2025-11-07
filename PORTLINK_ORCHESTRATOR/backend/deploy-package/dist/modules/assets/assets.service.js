"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const asset_entity_1 = require("./entities/asset.entity");
const asset_dto_1 = require("./dto/asset.dto");
let AssetsService = class AssetsService {
    constructor(assetRepository) {
        this.assetRepository = assetRepository;
    }
    async create(createAssetDto) {
        const asset = this.assetRepository.create({
            ...createAssetDto,
            status: asset_dto_1.AssetStatus.AVAILABLE,
        });
        return await this.assetRepository.save(asset);
    }
    async findAll(filterDto) {
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
            query.andWhere('(asset.name ILIKE :search OR asset.model ILIKE :search)', { search: `%${filterDto.search}%` });
        }
        query.orderBy('asset.name', 'ASC');
        return await query.getMany();
    }
    async findOne(id) {
        const asset = await this.assetRepository.findOne({
            where: { id },
        });
        if (!asset) {
            throw new common_1.NotFoundException(`Asset with ID ${id} not found`);
        }
        return asset;
    }
    async findByType(type) {
        return await this.assetRepository.find({
            where: { type },
            order: { name: 'ASC' },
        });
    }
    async findByStatus(status) {
        return await this.assetRepository.find({
            where: { status },
            order: { name: 'ASC' },
        });
    }
    async findAvailable(type) {
        const query = this.assetRepository.createQueryBuilder('asset')
            .where('asset.status = :status', { status: asset_dto_1.AssetStatus.AVAILABLE });
        if (type) {
            query.andWhere('asset.type = :type', { type });
        }
        query.orderBy('asset.name', 'ASC');
        return await query.getMany();
    }
    async update(id, updateAssetDto) {
        const asset = await this.findOne(id);
        Object.assign(asset, updateAssetDto);
        return await this.assetRepository.save(asset);
    }
    async updateStatus(id, status) {
        const asset = await this.findOne(id);
        asset.status = status;
        return await this.assetRepository.save(asset);
    }
    async remove(id) {
        const asset = await this.findOne(id);
        await this.assetRepository.remove(asset);
    }
    async getStatistics() {
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
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AssetsService);
//# sourceMappingURL=assets.service.js.map