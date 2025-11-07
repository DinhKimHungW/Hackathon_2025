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
exports.ConflictsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conflict_entity_1 = require("./entities/conflict.entity");
let ConflictsService = class ConflictsService {
    constructor(conflictRepository) {
        this.conflictRepository = conflictRepository;
    }
    async create(createDto) {
        const { conflictTime, ...rest } = createDto;
        const conflict = this.conflictRepository.create({
            ...rest,
            conflictTime: new Date(conflictTime),
        });
        return this.conflictRepository.save(conflict);
    }
    async findAll(query) {
        const { page, limit, conflictType, severity, resolved, simulationRunId, search } = query;
        const qb = this.conflictRepository
            .createQueryBuilder('conflict')
            .orderBy('conflict.conflictTime', 'DESC');
        if (conflictType && conflictType !== 'ALL') {
            qb.andWhere('conflict.conflictType = :conflictType', { conflictType });
        }
        if (severity && severity !== 'ALL') {
            qb.andWhere('conflict.severity = :severity', { severity });
        }
        if (resolved === 'RESOLVED') {
            qb.andWhere('conflict.resolved = :resolved', { resolved: true });
        }
        else if (resolved === 'UNRESOLVED') {
            qb.andWhere('conflict.resolved = :resolved', { resolved: false });
        }
        if (simulationRunId) {
            qb.andWhere('conflict.simulationRunId = :simulationRunId', { simulationRunId });
        }
        if (search) {
            qb.andWhere('(conflict.description ILIKE :search OR conflict.resolutionNotes ILIKE :search)', { search: `%${search}%` });
        }
        const [data, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const conflict = await this.conflictRepository.findOne({ where: { id } });
        if (!conflict) {
            throw new common_1.NotFoundException(`Conflict with id ${id} not found`);
        }
        return conflict;
    }
    async update(id, updateDto) {
        const conflict = await this.findOne(id);
        const { conflictTime, ...rest } = updateDto;
        Object.assign(conflict, rest);
        if (conflictTime) {
            conflict.conflictTime = new Date(conflictTime);
        }
        return this.conflictRepository.save(conflict);
    }
    async resolve(id, resolveDto) {
        const conflict = await this.findOne(id);
        conflict.resolved = true;
        if (resolveDto.resolutionNotes !== undefined) {
            conflict.resolutionNotes = resolveDto.resolutionNotes;
        }
        return this.conflictRepository.save(conflict);
    }
    async remove(id) {
        const result = await this.conflictRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Conflict with id ${id} not found`);
        }
    }
    async getStats(simulationRunId) {
        const whereClause = simulationRunId
            ? { simulationRunId }
            : {};
        const total = await this.conflictRepository.count({ where: whereClause });
        const unresolved = await this.conflictRepository.count({
            where: { ...whereClause, resolved: false },
        });
        const severityQb = this.conflictRepository
            .createQueryBuilder('conflict')
            .select('conflict.severity', 'severity')
            .addSelect('COUNT(conflict.id)', 'count');
        if (simulationRunId) {
            severityQb.where('conflict.simulationRunId = :simulationRunId', { simulationRunId });
        }
        const severityBreakdownRaw = await severityQb
            .groupBy('conflict.severity')
            .getRawMany();
        const typeQb = this.conflictRepository
            .createQueryBuilder('conflict')
            .select('conflict.conflictType', 'type')
            .addSelect('COUNT(conflict.id)', 'count');
        if (simulationRunId) {
            typeQb.where('conflict.simulationRunId = :simulationRunId', { simulationRunId });
        }
        const typeBreakdownRaw = await typeQb
            .groupBy('conflict.conflictType')
            .getRawMany();
        const bySeverity = {};
        Object.values(conflict_entity_1.ConflictSeverity).forEach((key) => {
            bySeverity[key] = 0;
        });
        severityBreakdownRaw.forEach((item) => {
            const key = item.severity;
            bySeverity[key] = Number(item.count) || 0;
        });
        const byType = {};
        Object.values(conflict_entity_1.ConflictType).forEach((key) => {
            byType[key] = 0;
        });
        typeBreakdownRaw.forEach((item) => {
            const key = item.type;
            byType[key] = Number(item.count) || 0;
        });
        const critical = bySeverity[conflict_entity_1.ConflictSeverity.CRITICAL] || 0;
        return {
            total,
            unresolved,
            critical,
            bySeverity,
            byType,
        };
    }
    async getUnresolved(limit = 20, simulationRunId) {
        const parsedLimit = Number.isFinite(limit) ? limit : 20;
        const safeLimit = parsedLimit > 0 ? parsedLimit : 20;
        const where = simulationRunId
            ? { resolved: false, simulationRunId }
            : { resolved: false };
        return this.conflictRepository.find({
            where,
            order: { conflictTime: 'DESC' },
            take: safeLimit,
        });
    }
};
exports.ConflictsService = ConflictsService;
exports.ConflictsService = ConflictsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conflict_entity_1.Conflict)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConflictsService);
//# sourceMappingURL=conflicts.service.js.map