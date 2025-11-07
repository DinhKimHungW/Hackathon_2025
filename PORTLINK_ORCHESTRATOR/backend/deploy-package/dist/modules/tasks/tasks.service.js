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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
let TasksService = class TasksService {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    async create(createTaskDto) {
        const task = this.taskRepository.create({
            ...createTaskDto,
            startTime: new Date(createTaskDto.startTime),
            endTime: new Date(createTaskDto.endTime),
            status: task_entity_1.TaskStatus.PENDING,
            priority: createTaskDto.priority || 0,
        });
        return await this.taskRepository.save(task);
    }
    async findAll(filterDto) {
        const query = this.taskRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.schedule', 'schedule')
            .leftJoinAndSelect('task.asset', 'asset');
        if (filterDto?.taskType) {
            query.andWhere('task.taskType = :taskType', { taskType: filterDto.taskType });
        }
        if (filterDto?.status) {
            query.andWhere('task.status = :status', { status: filterDto.status });
        }
        if (filterDto?.scheduleId) {
            query.andWhere('task.scheduleId = :scheduleId', { scheduleId: filterDto.scheduleId });
        }
        if (filterDto?.assetId) {
            query.andWhere('task.assetId = :assetId', { assetId: filterDto.assetId });
        }
        if (filterDto?.assignedTo) {
            query.andWhere('task.assignedTo = :assignedTo', { assignedTo: filterDto.assignedTo });
        }
        if (filterDto?.search) {
            query.andWhere('(task.taskName ILIKE :search OR task.notes ILIKE :search)', {
                search: `%${filterDto.search}%`
            });
        }
        query.orderBy('task.priority', 'DESC').addOrderBy('task.startTime', 'ASC');
        return await query.getMany();
    }
    async findOne(id) {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['schedule', 'asset'],
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }
    async findByAsset(assetId) {
        return await this.taskRepository.find({
            where: { assetId },
            relations: ['schedule'],
            order: { startTime: 'ASC' },
        });
    }
    async findBySchedule(scheduleId) {
        return await this.taskRepository.find({
            where: { scheduleId },
            relations: ['asset'],
            order: { priority: 'DESC', startTime: 'ASC' },
        });
    }
    async findByStatus(status) {
        return await this.taskRepository.find({
            where: { status },
            relations: ['schedule', 'asset'],
            order: { priority: 'DESC', startTime: 'ASC' },
        });
    }
    async findByAssignedTo(assignedTo) {
        return await this.taskRepository.find({
            where: { assignedTo },
            relations: ['schedule', 'asset'],
            order: { priority: 'DESC', startTime: 'ASC' },
        });
    }
    async findActive() {
        return await this.taskRepository.find({
            where: { status: task_entity_1.TaskStatus.IN_PROGRESS },
            relations: ['schedule', 'asset'],
            order: { priority: 'DESC' },
        });
    }
    async findPending() {
        return await this.taskRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.schedule', 'schedule')
            .leftJoinAndSelect('task.asset', 'asset')
            .where('task.status IN (:...statuses)', { statuses: [task_entity_1.TaskStatus.PENDING, task_entity_1.TaskStatus.ASSIGNED] })
            .orderBy('task.priority', 'DESC')
            .addOrderBy('task.startTime', 'ASC')
            .getMany();
    }
    async update(id, updateTaskDto) {
        const task = await this.findOne(id);
        if (updateTaskDto.startTime) {
            task.startTime = new Date(updateTaskDto.startTime);
        }
        if (updateTaskDto.endTime) {
            task.endTime = new Date(updateTaskDto.endTime);
        }
        if (updateTaskDto.actualStartTime) {
            task.actualStartTime = new Date(updateTaskDto.actualStartTime);
        }
        if (updateTaskDto.actualEndTime) {
            task.actualEndTime = new Date(updateTaskDto.actualEndTime);
        }
        Object.assign(task, {
            ...updateTaskDto,
            startTime: task.startTime,
            endTime: task.endTime,
            actualStartTime: task.actualStartTime,
            actualEndTime: task.actualEndTime,
        });
        return await this.taskRepository.save(task);
    }
    async updateStatus(id, status) {
        const task = await this.findOne(id);
        task.status = status;
        const now = new Date();
        if (status === task_entity_1.TaskStatus.IN_PROGRESS && !task.actualStartTime) {
            task.actualStartTime = now;
        }
        else if ((status === task_entity_1.TaskStatus.COMPLETED || status === task_entity_1.TaskStatus.FAILED) && !task.actualEndTime) {
            task.actualEndTime = now;
            if (task.actualStartTime) {
                task.actualDuration = Math.floor((now.getTime() - task.actualStartTime.getTime()) / 60000);
            }
            if (status === task_entity_1.TaskStatus.COMPLETED) {
                task.completionPercentage = 100;
            }
        }
        return await this.taskRepository.save(task);
    }
    async updateProgress(id, percentage) {
        const task = await this.findOne(id);
        task.completionPercentage = Math.min(100, Math.max(0, percentage));
        if (task.completionPercentage === 100 && task.status === task_entity_1.TaskStatus.IN_PROGRESS) {
            task.status = task_entity_1.TaskStatus.COMPLETED;
            task.actualEndTime = new Date();
            if (task.actualStartTime) {
                task.actualDuration = Math.floor((task.actualEndTime.getTime() - task.actualStartTime.getTime()) / 60000);
            }
        }
        return await this.taskRepository.save(task);
    }
    async assignAsset(id, assetId) {
        const task = await this.findOne(id);
        task.assetId = assetId;
        if (task.status === task_entity_1.TaskStatus.PENDING) {
            task.status = task_entity_1.TaskStatus.ASSIGNED;
        }
        return await this.taskRepository.save(task);
    }
    async assignTo(id, assignedTo) {
        const task = await this.findOne(id);
        task.assignedTo = assignedTo;
        if (task.status === task_entity_1.TaskStatus.PENDING) {
            task.status = task_entity_1.TaskStatus.ASSIGNED;
        }
        return await this.taskRepository.save(task);
    }
    async remove(id) {
        const task = await this.findOne(id);
        await this.taskRepository.remove(task);
    }
    async getStatistics() {
        const total = await this.taskRepository.count();
        const byStatus = await this.taskRepository
            .createQueryBuilder('task')
            .select('task.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('task.status')
            .getRawMany();
        const byType = await this.taskRepository
            .createQueryBuilder('task')
            .select('task.taskType', 'taskType')
            .addSelect('COUNT(*)', 'count')
            .groupBy('task.taskType')
            .getRawMany();
        const active = await this.taskRepository.count({
            where: { status: task_entity_1.TaskStatus.IN_PROGRESS },
        });
        const pending = await this.taskRepository
            .createQueryBuilder('task')
            .where('task.status IN (:...statuses)', { statuses: [task_entity_1.TaskStatus.PENDING, task_entity_1.TaskStatus.ASSIGNED] })
            .getCount();
        const avgCompletion = await this.taskRepository
            .createQueryBuilder('task')
            .select('AVG(task.completionPercentage)', 'avg')
            .where('task.status = :status', { status: task_entity_1.TaskStatus.IN_PROGRESS })
            .getRawOne();
        return {
            total,
            active,
            pending,
            averageCompletion: parseFloat(avgCompletion?.avg || '0').toFixed(2),
            byStatus: byStatus.reduce((acc, item) => {
                acc[item.status] = parseInt(item.count);
                return acc;
            }, {}),
            byType: byType.reduce((acc, item) => {
                acc[item.tasktype] = parseInt(item.count);
                return acc;
            }, {}),
        };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map