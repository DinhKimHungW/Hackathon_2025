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
exports.ConflictDetectionService = exports.ConflictSeverity = exports.ConflictType = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../tasks/entities/task.entity");
const asset_entity_1 = require("../assets/entities/asset.entity");
const ship_visit_entity_1 = require("../ship-visits/entities/ship-visit.entity");
var ConflictType;
(function (ConflictType) {
    ConflictType["RESOURCE_DOUBLE_BOOKING"] = "RESOURCE_DOUBLE_BOOKING";
    ConflictType["CAPACITY_EXCEEDED"] = "CAPACITY_EXCEEDED";
    ConflictType["TIME_CONSTRAINT_VIOLATION"] = "TIME_CONSTRAINT_VIOLATION";
    ConflictType["DEPENDENCY_VIOLATION"] = "DEPENDENCY_VIOLATION";
})(ConflictType || (exports.ConflictType = ConflictType = {}));
var ConflictSeverity;
(function (ConflictSeverity) {
    ConflictSeverity["CRITICAL"] = "CRITICAL";
    ConflictSeverity["HIGH"] = "HIGH";
    ConflictSeverity["MEDIUM"] = "MEDIUM";
    ConflictSeverity["LOW"] = "LOW";
})(ConflictSeverity || (exports.ConflictSeverity = ConflictSeverity = {}));
let ConflictDetectionService = class ConflictDetectionService {
    constructor(taskRepository, assetRepository, shipVisitRepository) {
        this.taskRepository = taskRepository;
        this.assetRepository = assetRepository;
        this.shipVisitRepository = shipVisitRepository;
    }
    async detectAllConflicts(scheduleId, tasks) {
        const conflicts = [];
        const doubleBookingConflicts = await this.detectResourceDoubleBooking(tasks);
        conflicts.push(...doubleBookingConflicts);
        const capacityConflicts = await this.detectCapacityExceeded(tasks);
        conflicts.push(...capacityConflicts);
        const timeConstraintConflicts = await this.detectTimeConstraintViolations(tasks);
        conflicts.push(...timeConstraintConflicts);
        const dependencyConflicts = await this.detectDependencyViolations(tasks);
        conflicts.push(...dependencyConflicts);
        return conflicts;
    }
    async detectResourceDoubleBooking(tasks) {
        const conflicts = [];
        const tasksByAsset = new Map();
        for (const task of tasks) {
            if (task.assetId) {
                if (!tasksByAsset.has(task.assetId)) {
                    tasksByAsset.set(task.assetId, []);
                }
                tasksByAsset.get(task.assetId).push(task);
            }
        }
        for (const [assetId, assetTasks] of tasksByAsset) {
            const asset = await this.assetRepository.findOne({ where: { id: assetId } });
            for (let i = 0; i < assetTasks.length; i++) {
                for (let j = i + 1; j < assetTasks.length; j++) {
                    const task1 = assetTasks[i];
                    const task2 = assetTasks[j];
                    if (this.isTimeOverlap(task1.startTime, task1.endTime, task2.startTime, task2.endTime)) {
                        const overlapDurationHours = this.calculateOverlapDuration(task1.startTime, task1.endTime, task2.startTime, task2.endTime);
                        const severity = this.calculateSeverity(overlapDurationHours);
                        conflicts.push({
                            type: ConflictType.RESOURCE_DOUBLE_BOOKING,
                            severity,
                            description: `${asset?.type} "${asset?.name}" is double-booked: Tasks "${task1.taskName}" and "${task2.taskName}" overlap for ${overlapDurationHours.toFixed(1)} hours`,
                            affectedTaskIds: [task1.id, task2.id],
                            affectedResources: [
                                {
                                    assetId: asset?.id,
                                    assetName: asset?.name,
                                    assetType: asset?.type,
                                },
                            ],
                            timeRange: {
                                start: new Date(Math.max(task1.startTime.getTime(), task2.startTime.getTime())),
                                end: new Date(Math.min(task1.endTime.getTime(), task2.endTime.getTime())),
                            },
                        });
                    }
                }
            }
        }
        return conflicts;
    }
    async detectCapacityExceeded(tasks) {
        const conflicts = [];
        for (const task of tasks) {
            if (!task.assetId || !task.scheduleId)
                continue;
            const asset = await this.assetRepository.findOne({ where: { id: task.assetId } });
            if (!asset)
                continue;
            const schedule = await this.taskRepository
                .createQueryBuilder('task')
                .leftJoinAndSelect('task.schedule', 'schedule')
                .leftJoinAndSelect('schedule.shipVisit', 'shipVisit')
                .where('task.id = :taskId', { taskId: task.id })
                .getOne();
            const shipVisit = schedule?.schedule?.shipVisit;
            if (!shipVisit)
                continue;
            const maxCapacity = asset.specifications?.maxCapacity;
            const currentLoad = shipVisit.totalContainers || 0;
            if (maxCapacity && currentLoad > maxCapacity) {
                conflicts.push({
                    type: ConflictType.CAPACITY_EXCEEDED,
                    severity: ConflictSeverity.CRITICAL,
                    description: `Asset "${asset.name}" max capacity (${maxCapacity}) is insufficient for vessel "${shipVisit.vesselName}" load (${currentLoad})`,
                    affectedTaskIds: [task.id],
                    affectedResources: [
                        {
                            assetId: asset.id,
                            assetName: asset.name,
                            assetType: asset.type,
                        },
                    ],
                });
            }
            if (asset.type === asset_entity_1.AssetType.CRANE) {
                const craneCapacity = asset.specifications?.craneCapacity;
                const cargoWeight = shipVisit.totalContainers;
                if (craneCapacity && cargoWeight && cargoWeight > craneCapacity) {
                    conflicts.push({
                        type: ConflictType.CAPACITY_EXCEEDED,
                        severity: ConflictSeverity.HIGH,
                        description: `Crane "${asset.name}" capacity (${craneCapacity}t) is insufficient for cargo (${cargoWeight} containers)`,
                        affectedTaskIds: [task.id],
                        affectedResources: [
                            {
                                assetId: asset.id,
                                assetName: asset.name,
                                assetType: asset.type,
                            },
                        ],
                    });
                }
            }
        }
        return conflicts;
    }
    async detectTimeConstraintViolations(tasks) {
        const conflicts = [];
        for (const task of tasks) {
            if (!task.scheduleId)
                continue;
            const schedule = await this.taskRepository
                .createQueryBuilder('task')
                .leftJoinAndSelect('task.schedule', 'schedule')
                .leftJoinAndSelect('schedule.shipVisit', 'shipVisit')
                .where('task.id = :taskId', { taskId: task.id })
                .getOne();
            const shipVisit = schedule?.schedule?.shipVisit;
            if (!shipVisit)
                continue;
            const eta = shipVisit.ata || shipVisit.eta;
            if (task.startTime < eta) {
                const violationHours = (eta.getTime() - task.startTime.getTime()) / (1000 * 60 * 60);
                conflicts.push({
                    type: ConflictType.TIME_CONSTRAINT_VIOLATION,
                    severity: ConflictSeverity.HIGH,
                    description: `Task "${task.taskName}" is scheduled to start ${violationHours.toFixed(1)} hours before vessel "${shipVisit.vesselName}" arrives`,
                    affectedTaskIds: [task.id],
                    affectedResources: [],
                    timeRange: {
                        start: task.startTime,
                        end: eta,
                    },
                });
            }
            const taskDurationHours = (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60);
            if (taskDurationHours > 24) {
                conflicts.push({
                    type: ConflictType.TIME_CONSTRAINT_VIOLATION,
                    severity: ConflictSeverity.MEDIUM,
                    description: `Task "${task.taskName}" duration (${taskDurationHours.toFixed(1)} hours) exceeds reasonable limit (24 hours)`,
                    affectedTaskIds: [task.id],
                    affectedResources: [],
                });
            }
        }
        return conflicts;
    }
    async detectDependencyViolations(tasks) {
        const conflicts = [];
        for (const task of tasks) {
            const predecessorTaskIds = task.metadata?.predecessorTaskIds;
            if (predecessorTaskIds && predecessorTaskIds.length > 0) {
                for (const predecessorId of predecessorTaskIds) {
                    const predecessor = tasks.find((t) => t.id === predecessorId);
                    if (predecessor) {
                        if (task.startTime < predecessor.endTime) {
                            const violationHours = (predecessor.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60);
                            conflicts.push({
                                type: ConflictType.DEPENDENCY_VIOLATION,
                                severity: ConflictSeverity.HIGH,
                                description: `Task "${task.taskName}" cannot start before predecessor "${predecessor.taskName}" completes (violation: ${violationHours.toFixed(1)} hours)`,
                                affectedTaskIds: [task.id, predecessor.id],
                                affectedResources: [],
                                timeRange: {
                                    start: task.startTime,
                                    end: predecessor.endTime,
                                },
                            });
                        }
                    }
                }
            }
        }
        return conflicts;
    }
    isTimeOverlap(start1, end1, start2, end2) {
        return start1 < end2 && start2 < end1;
    }
    calculateOverlapDuration(start1, end1, start2, end2) {
        const overlapStart = Math.max(start1.getTime(), start2.getTime());
        const overlapEnd = Math.min(end1.getTime(), end2.getTime());
        return (overlapEnd - overlapStart) / (1000 * 60 * 60);
    }
    calculateSeverity(durationHours) {
        if (durationHours >= 8)
            return ConflictSeverity.CRITICAL;
        if (durationHours >= 4)
            return ConflictSeverity.HIGH;
        if (durationHours >= 1)
            return ConflictSeverity.MEDIUM;
        return ConflictSeverity.LOW;
    }
};
exports.ConflictDetectionService = ConflictDetectionService;
exports.ConflictDetectionService = ConflictDetectionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __param(2, (0, typeorm_1.InjectRepository)(ship_visit_entity_1.ShipVisit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConflictDetectionService);
//# sourceMappingURL=conflict-detection.service.js.map