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
exports.SchedulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_entity_1 = require("./entities/schedule.entity");
const schedule_dto_1 = require("./dto/schedule.dto");
const user_entity_1 = require("../users/entities/user.entity");
let SchedulesService = class SchedulesService {
    constructor(scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }
    async create(createScheduleDto) {
        const conflicts = await this.findConflicts(createScheduleDto.startTime, createScheduleDto.endTime);
        if (conflicts.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Schedule conflicts with existing schedules',
                conflicts: conflicts.map(c => ({
                    id: c.id,
                    operation: c.operation,
                    startTime: c.startTime,
                    endTime: c.endTime,
                })),
            });
        }
        const schedule = this.scheduleRepository.create({
            ...createScheduleDto,
            status: schedule_dto_1.ScheduleStatus.PENDING,
        });
        const saved = await this.scheduleRepository.save(schedule);
        return this.findOne(saved.id);
    }
    async findAllForUser(user, filterDto) {
        const query = this.buildBaseQuery();
        if (filterDto?.status) {
            query.andWhere('schedule.status = :status', { status: filterDto.status });
        }
        if (filterDto?.shipVisitId) {
            query.andWhere('schedule.shipVisitId = :shipVisitId', {
                shipVisitId: filterDto.shipVisitId,
            });
        }
        if (filterDto?.operation) {
            query.andWhere('schedule.operation ILIKE :operation', {
                operation: `%${filterDto.operation}%`,
            });
        }
        if (filterDto?.fromDate && filterDto?.toDate) {
            query.andWhere('schedule.startTime BETWEEN :fromDate AND :toDate', {
                fromDate: filterDto.fromDate,
                toDate: filterDto.toDate,
            });
        }
        else if (filterDto?.fromDate) {
            query.andWhere('schedule.startTime >= :fromDate', {
                fromDate: filterDto.fromDate,
            });
        }
        else if (filterDto?.toDate) {
            query.andWhere('schedule.startTime <= :toDate', {
                toDate: filterDto.toDate,
            });
        }
        if (filterDto?.assignedTo) {
            query.andWhere('(task.assignedTo = :assignedTo OR task.metadata ->> :assignedKey = :assignedTo)', {
                assignedTo: filterDto.assignedTo,
                assignedKey: 'driverId',
            });
        }
        const normalizedRole = user.role;
        if (normalizedRole === user_entity_1.UserRole.DRIVER || filterDto?.onlyMine) {
            query.andWhere(`(
          task.assignedTo = :userId
          OR task.assignedTo = :username
          OR task.metadata ->> 'driverId' = :userId
          OR schedule.resources ->> 'assignedDriverId' = :userId
        )`, {
                userId: user.id,
                username: user.username,
            });
        }
        query.orderBy('schedule.startTime', 'ASC');
        const schedules = await query.getMany();
        return schedules.map((item) => this.mapToResponse(item));
    }
    async findOne(id) {
        const schedule = await this.buildBaseQuery()
            .where('schedule.id = :id', { id })
            .getOne();
        if (!schedule) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        return this.mapToResponse(schedule);
    }
    async findByShipVisit(shipVisitId) {
        const schedules = await this.buildBaseQuery()
            .where('schedule.shipVisitId = :shipVisitId', { shipVisitId })
            .orderBy('schedule.startTime', 'ASC')
            .getMany();
        return schedules.map((item) => this.mapToResponse(item));
    }
    async findByStatus(status) {
        const schedules = await this.buildBaseQuery()
            .where('schedule.status = :status', { status })
            .orderBy('schedule.startTime', 'ASC')
            .getMany();
        return schedules.map((item) => this.mapToResponse(item));
    }
    async findUpcoming(hours = 24) {
        const now = new Date();
        const future = new Date();
        future.setHours(future.getHours() + hours);
        const schedules = await this.buildBaseQuery()
            .where('schedule.startTime BETWEEN :now AND :future', { now, future })
            .andWhere('schedule.status = :status', {
            status: schedule_dto_1.ScheduleStatus.SCHEDULED,
        })
            .orderBy('schedule.startTime', 'ASC')
            .getMany();
        return schedules.map((item) => this.mapToResponse(item));
    }
    async findActive() {
        const schedules = await this.buildBaseQuery()
            .where('schedule.status = :status', {
            status: schedule_dto_1.ScheduleStatus.IN_PROGRESS,
        })
            .orderBy('schedule.startTime', 'ASC')
            .getMany();
        return schedules.map((item) => this.mapToResponse(item));
    }
    async findConflicts(startTime, endTime, excludeId) {
        const query = this.scheduleRepository.createQueryBuilder('schedule')
            .where('schedule.status NOT IN (:...statuses)', {
            statuses: [schedule_dto_1.ScheduleStatus.COMPLETED, schedule_dto_1.ScheduleStatus.CANCELLED],
        })
            .andWhere('(schedule.startTime < :endTime AND schedule.endTime > :startTime)', { startTime, endTime });
        if (excludeId) {
            query.andWhere('schedule.id != :excludeId', { excludeId });
        }
        return await query.getMany();
    }
    async update(id, updateScheduleDto) {
        const schedule = await this.findOne(id);
        if (updateScheduleDto.startTime || updateScheduleDto.endTime) {
            const startTime = updateScheduleDto.startTime || schedule.startTime;
            const endTime = updateScheduleDto.endTime || schedule.endTime;
            const conflicts = await this.findConflicts(startTime, endTime, id);
            if (conflicts.length > 0) {
                throw new common_1.BadRequestException({
                    message: 'Updated schedule conflicts with existing schedules',
                    conflicts: conflicts.map(c => ({
                        id: c.id,
                        operation: c.operation,
                        startTime: c.startTime,
                        endTime: c.endTime,
                    })),
                });
            }
        }
        const entity = await this.scheduleRepository.findOne({ where: { id } });
        if (!entity) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        Object.assign(entity, updateScheduleDto);
        await this.scheduleRepository.save(entity);
        return this.findOne(id);
    }
    async updateStatus(id, status) {
        const schedule = await this.scheduleRepository.findOne({ where: { id } });
        if (!schedule) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        schedule.status = status;
        await this.scheduleRepository.save(schedule);
        return this.findOne(id);
    }
    async remove(id) {
        const entity = await this.scheduleRepository.findOne({ where: { id } });
        if (!entity) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        await this.scheduleRepository.remove(entity);
    }
    async getStatistics() {
        const total = await this.scheduleRepository.count();
        const byStatus = await this.scheduleRepository
            .createQueryBuilder('schedule')
            .select('schedule.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('schedule.status')
            .getRawMany();
        const active = await this.scheduleRepository.count({
            where: { status: schedule_dto_1.ScheduleStatus.IN_PROGRESS },
        });
        const upcoming = await this.findUpcoming(24);
        return {
            total,
            active,
            upcoming: upcoming.length,
            byStatus: byStatus.reduce((acc, item) => {
                acc[item.status] = parseInt(item.count);
                return acc;
            }, {}),
        };
    }
    buildBaseQuery() {
        return this.scheduleRepository
            .createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.shipVisit', 'shipVisit')
            .leftJoinAndSelect('schedule.tasks', 'task')
            .leftJoinAndSelect('task.asset', 'asset');
    }
    mapToResponse(schedule) {
        const resources = (schedule.resources ?? null);
        const shipVisit = schedule.shipVisit
            ? {
                id: schedule.shipVisit.id,
                vesselName: schedule.shipVisit.vesselName,
                vesselIMO: schedule.shipVisit.vesselIMO,
                voyageNumber: schedule.shipVisit.voyageNumber,
                assignedBerth: schedule.shipVisit.berthLocation,
            }
            : null;
        const tasks = (schedule.tasks ?? []).map((task) => ({
            id: task.id,
            taskName: task.taskName,
            taskType: task.taskType,
            status: task.status,
            startTime: task.startTime,
            endTime: task.endTime,
            assignedTo: task.assignedTo ?? null,
            location: task.location ?? null,
            assetId: task.assetId ?? null,
            asset: task.asset
                ? {
                    id: task.asset.id,
                    name: task.asset.name,
                    type: task.asset.type,
                    status: task.asset.status,
                }
                : null,
            metadata: task.metadata ?? null,
            notes: task.notes ?? null,
        }));
        return {
            id: schedule.id,
            name: schedule.operation ?? 'Unnamed Schedule',
            operation: schedule.operation ?? null,
            description: schedule.notes ?? null,
            type: this.inferScheduleType(schedule.operation),
            status: schedule.status,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            actualStartTime: schedule.actualStartTime ?? null,
            actualEndTime: schedule.actualEndTime ?? null,
            completionPercentage: schedule.completionPercentage ?? null,
            priority: schedule.priority ?? null,
            shipVisitId: schedule.shipVisitId ?? null,
            shipVisit,
            berthId: resources?.berthId ?? null,
            berthName: resources?.berthName ?? shipVisit?.assignedBerth ?? null,
            resources,
            notes: schedule.notes ?? null,
            tasks,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt,
            createdBy: 'System',
            updatedBy: 'System',
        };
    }
    inferScheduleType(operation) {
        if (!operation) {
            return 'PORT_OPERATION';
        }
        const normalized = operation.toLowerCase();
        if (normalized.includes('arrival') || normalized.includes('berth')) {
            return 'SHIP_ARRIVAL';
        }
        if (normalized.includes('mainten')) {
            return 'MAINTENANCE';
        }
        return 'PORT_OPERATION';
    }
};
exports.SchedulesService = SchedulesService;
exports.SchedulesService = SchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SchedulesService);
//# sourceMappingURL=schedules.service.js.map