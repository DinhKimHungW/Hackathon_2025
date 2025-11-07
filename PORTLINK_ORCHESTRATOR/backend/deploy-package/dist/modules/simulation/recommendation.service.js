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
exports.RecommendationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../tasks/entities/task.entity");
const asset_entity_1 = require("../assets/entities/asset.entity");
const conflict_detection_service_1 = require("./conflict-detection.service");
let RecommendationService = class RecommendationService {
    constructor(taskRepository, assetRepository) {
        this.taskRepository = taskRepository;
        this.assetRepository = assetRepository;
    }
    async generateRecommendations(conflicts, tasks) {
        const recommendations = [];
        for (const conflict of conflicts) {
            switch (conflict.type) {
                case conflict_detection_service_1.ConflictType.RESOURCE_DOUBLE_BOOKING:
                    recommendations.push(...(await this.resolveDoubleBooking(conflict, tasks)));
                    break;
                case conflict_detection_service_1.ConflictType.CAPACITY_EXCEEDED:
                    recommendations.push(...(await this.resolveCapacityExceeded(conflict, tasks)));
                    break;
                case conflict_detection_service_1.ConflictType.TIME_CONSTRAINT_VIOLATION:
                    recommendations.push(...(await this.resolveTimeConstraint(conflict, tasks)));
                    break;
                case conflict_detection_service_1.ConflictType.DEPENDENCY_VIOLATION:
                    recommendations.push(...(await this.resolveDependencyViolation(conflict, tasks)));
                    break;
            }
        }
        return recommendations;
    }
    async resolveDoubleBooking(conflict, tasks) {
        const recommendations = [];
        if (!conflict.affectedTaskIds || conflict.affectedTaskIds.length < 2) {
            return recommendations;
        }
        const task1 = tasks.find((t) => t.id === conflict.affectedTaskIds[0]);
        const task2 = tasks.find((t) => t.id === conflict.affectedTaskIds[1]);
        if (!task1 || !task2)
            return recommendations;
        const task2Duration = (task2.endTime.getTime() - task2.startTime.getTime()) / (1000 * 60 * 60);
        const delayNeeded = (task1.endTime.getTime() - task2.startTime.getTime()) / (1000 * 60 * 60);
        recommendations.push({
            type: 'TIME_ADJUSTMENT',
            description: `Delay task "${task2.taskName}" to start after "${task1.taskName}" completes (delay: ${delayNeeded.toFixed(1)} hours)`,
            estimatedImpact: `${delayNeeded.toFixed(1)} hour delay for Task ${task2.taskName}. May cascade to ${this.countDependentTasks(task2, tasks)} dependent tasks.`,
            timeAdjustmentHours: Math.ceil(delayNeeded),
            affectedTaskIds: [task2.id],
        });
        if (conflict.affectedResources && conflict.affectedResources.length > 0) {
            const currentAssetId = conflict.affectedResources[0].assetId;
            const currentAssetType = conflict.affectedResources[0].assetType;
            if (currentAssetId) {
                const alternativeAssets = await this.findAlternativeAsset(currentAssetId, currentAssetType, task2.startTime, task2.endTime);
                for (const altAsset of alternativeAssets) {
                    recommendations.push({
                        type: 'ALTERNATIVE_RESOURCE',
                        description: `Reassign task "${task2.taskName}" to alternative ${altAsset.type} "${altAsset.name}"`,
                        estimatedImpact: `No time delay. May incur additional operational costs.`,
                        alternativeAssetId: altAsset.id,
                        affectedTaskIds: [task2.id],
                    });
                }
            }
        }
        return recommendations;
    }
    async resolveCapacityExceeded(conflict, tasks) {
        const recommendations = [];
        if (!conflict.affectedTaskIds || conflict.affectedTaskIds.length === 0) {
            return recommendations;
        }
        const task = tasks.find((t) => t.id === conflict.affectedTaskIds[0]);
        if (!task)
            return recommendations;
        if (conflict.affectedResources && conflict.affectedResources.length > 0) {
            const currentAssetId = conflict.affectedResources[0].assetId;
            const currentAssetType = conflict.affectedResources[0].assetType;
            if (currentAssetId) {
                const higherCapacityAssets = await this.findHigherCapacityAsset(currentAssetId, currentAssetType, task.startTime, task.endTime);
                for (const asset of higherCapacityAssets) {
                    recommendations.push({
                        type: 'ALTERNATIVE_RESOURCE_HIGHER_CAPACITY',
                        description: `Reassign to higher capacity ${asset.type} "${asset.name}"`,
                        estimatedImpact: `Solves capacity issue. May require repositioning or higher cost.`,
                        alternativeAssetId: asset.id,
                        affectedTaskIds: [task.id],
                    });
                }
            }
        }
        if (conflict.severity === 'CRITICAL') {
            recommendations.push({
                type: 'RESCHEDULE_VESSEL',
                description: `Vessel cannot be accommodated. Recommend rescheduling to different time slot or port facility.`,
                estimatedImpact: `Critical - Requires customer notification and rescheduling coordination.`,
                affectedTaskIds: [task.id],
            });
        }
        return recommendations;
    }
    async resolveTimeConstraint(conflict, tasks) {
        const recommendations = [];
        if (!conflict.affectedTaskIds || conflict.affectedTaskIds.length === 0) {
            return recommendations;
        }
        const task = tasks.find((t) => t.id === conflict.affectedTaskIds[0]);
        if (!task)
            return recommendations;
        if (conflict.timeRange) {
            const delayNeeded = (conflict.timeRange.end.getTime() - task.startTime.getTime()) / (1000 * 60 * 60);
            recommendations.push({
                type: 'TIME_ADJUSTMENT',
                description: `Adjust task "${task.taskName}" to start after vessel arrives (delay: ${delayNeeded.toFixed(1)} hours)`,
                estimatedImpact: `${delayNeeded.toFixed(1)} hour delay. Aligns with vessel ETA.`,
                timeAdjustmentHours: Math.ceil(delayNeeded),
                affectedTaskIds: [task.id],
            });
        }
        return recommendations;
    }
    async resolveDependencyViolation(conflict, tasks) {
        const recommendations = [];
        if (!conflict.affectedTaskIds || conflict.affectedTaskIds.length < 2) {
            return recommendations;
        }
        const successorTask = tasks.find((t) => t.id === conflict.affectedTaskIds[0]);
        const predecessorTask = tasks.find((t) => t.id === conflict.affectedTaskIds[1]);
        if (!successorTask || !predecessorTask)
            return recommendations;
        const delayNeeded = (predecessorTask.endTime.getTime() - successorTask.startTime.getTime()) / (1000 * 60 * 60);
        recommendations.push({
            type: 'TIME_ADJUSTMENT_DEPENDENCY',
            description: `Delay task "${successorTask.taskName}" to start after prerequisite "${predecessorTask.taskName}" completes`,
            estimatedImpact: `${delayNeeded.toFixed(1)} hour delay to maintain dependency chain.`,
            timeAdjustmentHours: Math.ceil(delayNeeded),
            affectedTaskIds: [successorTask.id],
        });
        recommendations.push({
            type: 'REMOVE_DEPENDENCY',
            description: `Remove dependency between "${predecessorTask.taskName}" and "${successorTask.taskName}" if tasks can be parallelized`,
            estimatedImpact: `No time delay. Requires validation that tasks are truly independent.`,
            affectedTaskIds: [successorTask.id, predecessorTask.id],
        });
        return recommendations;
    }
    async findAlternativeAsset(currentAssetId, assetType, startTime, endTime) {
        const allAssets = await this.assetRepository.find({
            where: {
                type: assetType,
                status: asset_entity_1.AssetStatus.AVAILABLE,
            },
        });
        const alternatives = allAssets.filter((a) => a.id !== currentAssetId);
        const availableAlternatives = [];
        for (const asset of alternatives) {
            const conflictingTasks = await this.taskRepository
                .createQueryBuilder('task')
                .where('task.assetId = :assetId', { assetId: asset.id })
                .andWhere('task.startTime < :endTime', { endTime })
                .andWhere('task.endTime > :startTime', { startTime })
                .getCount();
            if (conflictingTasks === 0) {
                availableAlternatives.push(asset);
            }
        }
        return availableAlternatives.slice(0, 3);
    }
    async findHigherCapacityAsset(currentAssetId, assetType, startTime, endTime) {
        const currentAsset = await this.assetRepository.findOne({ where: { id: currentAssetId } });
        if (!currentAsset)
            return [];
        const currentCapacity = currentAsset.specifications?.maxCapacity || 0;
        const allAssets = await this.assetRepository.find({
            where: {
                type: assetType,
                status: asset_entity_1.AssetStatus.AVAILABLE,
            },
        });
        const higherCapacityAssets = allAssets.filter((a) => a.id !== currentAssetId && (a.specifications?.maxCapacity || 0) > currentCapacity);
        const availableAssets = [];
        for (const asset of higherCapacityAssets) {
            const conflictingTasks = await this.taskRepository
                .createQueryBuilder('task')
                .where('task.assetId = :assetId', { assetId: asset.id })
                .andWhere('task.startTime < :endTime', { endTime })
                .andWhere('task.endTime > :startTime', { startTime })
                .getCount();
            if (conflictingTasks === 0) {
                availableAssets.push(asset);
            }
        }
        return availableAssets.slice(0, 3);
    }
    countDependentTasks(task, allTasks) {
        let count = 0;
        for (const otherTask of allTasks) {
            const predecessors = otherTask.metadata?.predecessorTaskIds;
            if (predecessors && predecessors.includes(task.id)) {
                count++;
                count += this.countDependentTasks(otherTask, allTasks);
            }
        }
        return count;
    }
};
exports.RecommendationService = RecommendationService;
exports.RecommendationService = RecommendationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RecommendationService);
//# sourceMappingURL=recommendation.service.js.map