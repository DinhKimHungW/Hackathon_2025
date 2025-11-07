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
exports.EventLogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_log_entity_1 = require("./entities/event-log.entity");
let EventLogsService = class EventLogsService {
    constructor(eventLogRepository) {
        this.eventLogRepository = eventLogRepository;
    }
    async createLog(createEventLogDto) {
        const eventLog = this.eventLogRepository.create({
            ...createEventLogDto,
            severity: createEventLogDto.severity || event_log_entity_1.EventSeverity.INFO,
        });
        return await this.eventLogRepository.save(eventLog);
    }
    async logEvent(eventType, description, options) {
        return await this.createLog({
            eventType,
            description,
            severity: options?.severity || event_log_entity_1.EventSeverity.INFO,
            userId: options?.userId,
            entityType: options?.entityType,
            entityId: options?.entityId,
            metadata: options?.metadata,
            ipAddress: options?.ipAddress,
            userAgent: options?.userAgent,
        });
    }
    async findAll(filterDto) {
        const query = this.eventLogRepository.createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user');
        if (filterDto?.eventType) {
            query.andWhere('log.eventType = :eventType', { eventType: filterDto.eventType });
        }
        if (filterDto?.severity) {
            query.andWhere('log.severity = :severity', { severity: filterDto.severity });
        }
        if (filterDto?.userId) {
            query.andWhere('log.userId = :userId', { userId: filterDto.userId });
        }
        if (filterDto?.entityType) {
            query.andWhere('log.entityType = :entityType', { entityType: filterDto.entityType });
        }
        if (filterDto?.entityId) {
            query.andWhere('log.entityId = :entityId', { entityId: filterDto.entityId });
        }
        if (filterDto?.startDate && filterDto?.endDate) {
            query.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
                startDate: new Date(filterDto.startDate),
                endDate: new Date(filterDto.endDate),
            });
        }
        else if (filterDto?.startDate) {
            query.andWhere('log.createdAt >= :startDate', { startDate: new Date(filterDto.startDate) });
        }
        else if (filterDto?.endDate) {
            query.andWhere('log.createdAt <= :endDate', { endDate: new Date(filterDto.endDate) });
        }
        if (filterDto?.search) {
            query.andWhere('log.description ILIKE :search', { search: `%${filterDto.search}%` });
        }
        query.orderBy('log.createdAt', 'DESC');
        query.take(1000);
        return await query.getMany();
    }
    async findByEventType(eventType) {
        return await this.eventLogRepository.find({
            where: { eventType },
            relations: ['user'],
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
    async findBySeverity(severity) {
        return await this.eventLogRepository.find({
            where: { severity },
            relations: ['user'],
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
    async findByUser(userId) {
        return await this.eventLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
    async findByEntity(entityType, entityId) {
        return await this.eventLogRepository.find({
            where: { entityType, entityId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
    async getRecentLogs(limit = 50) {
        return await this.eventLogRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getStatistics() {
        const total = await this.eventLogRepository.count();
        const byType = await this.eventLogRepository
            .createQueryBuilder('log')
            .select('log.eventType', 'eventType')
            .addSelect('COUNT(*)', 'count')
            .groupBy('log.eventType')
            .getRawMany();
        const bySeverity = await this.eventLogRepository
            .createQueryBuilder('log')
            .select('log.severity', 'severity')
            .addSelect('COUNT(*)', 'count')
            .groupBy('log.severity')
            .getRawMany();
        const last24Hours = await this.eventLogRepository
            .createQueryBuilder('log')
            .where('log.createdAt >= :since', { since: new Date(Date.now() - 24 * 60 * 60 * 1000) })
            .getCount();
        const errors = await this.eventLogRepository.count({
            where: { severity: event_log_entity_1.EventSeverity.ERROR },
        });
        const critical = await this.eventLogRepository.count({
            where: { severity: event_log_entity_1.EventSeverity.CRITICAL },
        });
        return {
            total,
            last24Hours,
            errors,
            critical,
            byType: byType.reduce((acc, item) => {
                acc[item.eventtype] = parseInt(item.count);
                return acc;
            }, {}),
            bySeverity: bySeverity.reduce((acc, item) => {
                acc[item.severity] = parseInt(item.count);
                return acc;
            }, {}),
        };
    }
    async cleanOldLogs(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await this.eventLogRepository
            .createQueryBuilder()
            .delete()
            .where('createdAt < :cutoffDate', { cutoffDate })
            .execute();
        return result.affected || 0;
    }
};
exports.EventLogsService = EventLogsService;
exports.EventLogsService = EventLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_log_entity_1.EventLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EventLogsService);
//# sourceMappingURL=event-logs.service.js.map