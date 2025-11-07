import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Asset, AssetType, AssetStatus } from '../assets/entities/asset.entity';
import { ConflictDetailDto, RecommendationDto } from './dto/simulation.dto';
import { ConflictType } from './conflict-detection.service';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
  ) {}

  /**
   * Generate smart recommendations for all conflicts
   */
  async generateRecommendations(
    conflicts: ConflictDetailDto[],
    tasks: Task[],
  ): Promise<RecommendationDto[]> {
    const recommendations: RecommendationDto[] = [];

    for (const conflict of conflicts) {
      switch (conflict.type) {
        case ConflictType.RESOURCE_DOUBLE_BOOKING:
          recommendations.push(...(await this.resolveDoubleBooking(conflict, tasks)));
          break;

        case ConflictType.CAPACITY_EXCEEDED:
          recommendations.push(...(await this.resolveCapacityExceeded(conflict, tasks)));
          break;

        case ConflictType.TIME_CONSTRAINT_VIOLATION:
          recommendations.push(...(await this.resolveTimeConstraint(conflict, tasks)));
          break;

        case ConflictType.DEPENDENCY_VIOLATION:
          recommendations.push(...(await this.resolveDependencyViolation(conflict, tasks)));
          break;
      }
    }

    return recommendations;
  }

  /**
   * Resolve RESOURCE_DOUBLE_BOOKING conflicts
   */
  private async resolveDoubleBooking(
    conflict: ConflictDetailDto,
    tasks: Task[],
  ): Promise<RecommendationDto[]> {
    const recommendations: RecommendationDto[] = [];

    if (!conflict.affectedTaskIds || conflict.affectedTaskIds.length < 2) {
      return recommendations;
    }

    const task1 = tasks.find((t) => t.id === conflict.affectedTaskIds[0]);
    const task2 = tasks.find((t) => t.id === conflict.affectedTaskIds[1]);

    if (!task1 || !task2) return recommendations;

    // Recommendation 1: Time Adjustment - Delay second task
    const task2Duration = (task2.endTime.getTime() - task2.startTime.getTime()) / (1000 * 60 * 60);
    const delayNeeded = (task1.endTime.getTime() - task2.startTime.getTime()) / (1000 * 60 * 60);

    recommendations.push({
      type: 'TIME_ADJUSTMENT',
      description: `Delay task "${task2.taskName}" to start after "${task1.taskName}" completes (delay: ${delayNeeded.toFixed(1)} hours)`,
      estimatedImpact: `${delayNeeded.toFixed(1)} hour delay for Task ${task2.taskName}. May cascade to ${this.countDependentTasks(task2, tasks)} dependent tasks.`,
      timeAdjustmentHours: Math.ceil(delayNeeded),
      affectedTaskIds: [task2.id],
    });

    // Recommendation 2: Alternative Resource Finder
    if (conflict.affectedResources && conflict.affectedResources.length > 0) {
      const currentAssetId = conflict.affectedResources[0].assetId;
      const currentAssetType = conflict.affectedResources[0].assetType as AssetType;

      if (currentAssetId) {
        const alternativeAssets = await this.findAlternativeAsset(
          currentAssetId,
          currentAssetType,
          task2.startTime,
          task2.endTime,
        );

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

  /**
   * Resolve CAPACITY_EXCEEDED conflicts
   */
  private async resolveCapacityExceeded(
    conflict: ConflictDetailDto,
    tasks: Task[],
  ): Promise<RecommendationDto[]> {
    const recommendations: RecommendationDto[] = [];

    if (!conflict.affectedTaskIds || conflict.affectedTaskIds.length === 0) {
      return recommendations;
    }

    const task = tasks.find((t) => t.id === conflict.affectedTaskIds[0]);
    if (!task) return recommendations;

    // Find alternative asset with higher capacity
    if (conflict.affectedResources && conflict.affectedResources.length > 0) {
      const currentAssetId = conflict.affectedResources[0].assetId;
      const currentAssetType = conflict.affectedResources[0].assetType as AssetType;

      if (currentAssetId) {
        const higherCapacityAssets = await this.findHigherCapacityAsset(
          currentAssetId,
          currentAssetType,
          task.startTime,
          task.endTime,
        );

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

    // If critical (ship cannot berth), recommend cancellation or rescheduling
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

  /**
   * Resolve TIME_CONSTRAINT_VIOLATION conflicts
   */
  private async resolveTimeConstraint(
    conflict: ConflictDetailDto,
    tasks: Task[],
  ): Promise<RecommendationDto[]> {
    const recommendations: RecommendationDto[] = [];

    if (!conflict.affectedTaskIds || conflict.affectedTaskIds.length === 0) {
      return recommendations;
    }

    const task = tasks.find((t) => t.id === conflict.affectedTaskIds[0]);
    if (!task) return recommendations;

    // If task starts before ship arrival
    if (conflict.timeRange) {
      const delayNeeded =
        (conflict.timeRange.end.getTime() - task.startTime.getTime()) / (1000 * 60 * 60);

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

  /**
   * Resolve DEPENDENCY_VIOLATION conflicts
   */
  private async resolveDependencyViolation(
    conflict: ConflictDetailDto,
    tasks: Task[],
  ): Promise<RecommendationDto[]> {
    const recommendations: RecommendationDto[] = [];

    if (!conflict.affectedTaskIds || conflict.affectedTaskIds.length < 2) {
      return recommendations;
    }

    const successorTask = tasks.find((t) => t.id === conflict.affectedTaskIds[0]);
    const predecessorTask = tasks.find((t) => t.id === conflict.affectedTaskIds[1]);

    if (!successorTask || !predecessorTask) return recommendations;

    // Delay successor to start after predecessor
    const delayNeeded =
      (predecessorTask.endTime.getTime() - successorTask.startTime.getTime()) / (1000 * 60 * 60);

    recommendations.push({
      type: 'TIME_ADJUSTMENT_DEPENDENCY',
      description: `Delay task "${successorTask.taskName}" to start after prerequisite "${predecessorTask.taskName}" completes`,
      estimatedImpact: `${delayNeeded.toFixed(1)} hour delay to maintain dependency chain.`,
      timeAdjustmentHours: Math.ceil(delayNeeded),
      affectedTaskIds: [successorTask.id],
    });

    // Alternative: Remove dependency if not critical
    recommendations.push({
      type: 'REMOVE_DEPENDENCY',
      description: `Remove dependency between "${predecessorTask.taskName}" and "${successorTask.taskName}" if tasks can be parallelized`,
      estimatedImpact: `No time delay. Requires validation that tasks are truly independent.`,
      affectedTaskIds: [successorTask.id, predecessorTask.id],
    });

    return recommendations;
  }

  /**
   * Find alternative asset of same type that is available during time range
   */
  private async findAlternativeAsset(
    currentAssetId: string,
    assetType: AssetType,
    startTime: Date,
    endTime: Date,
  ): Promise<Asset[]> {
    // Find all assets of same type, excluding current one
    const allAssets = await this.assetRepository.find({
      where: {
        type: assetType,
        status: AssetStatus.AVAILABLE,
      },
    });

    const alternatives = allAssets.filter((a) => a.id !== currentAssetId);

    // Check if alternative is available during the time range
    // (In real implementation, check against other task assignments)
    const availableAlternatives: Asset[] = [];

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

    return availableAlternatives.slice(0, 3); // Return top 3
  }

  /**
   * Find asset with higher capacity
   */
  private async findHigherCapacityAsset(
    currentAssetId: string,
    assetType: AssetType,
    startTime: Date,
    endTime: Date,
  ): Promise<Asset[]> {
    const currentAsset = await this.assetRepository.findOne({ where: { id: currentAssetId } });
    if (!currentAsset) return [];

    const currentCapacity = currentAsset.specifications?.maxCapacity || 0;

    // Find assets with higher capacity
    const allAssets = await this.assetRepository.find({
      where: {
        type: assetType,
        status: AssetStatus.AVAILABLE,
      },
    });

    const higherCapacityAssets = allAssets.filter(
      (a) => a.id !== currentAssetId && (a.specifications?.maxCapacity || 0) > currentCapacity,
    );

    // Check availability
    const availableAssets: Asset[] = [];
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

  /**
   * Count dependent tasks (for impact estimation)
   */
  private countDependentTasks(task: Task, allTasks: Task[]): number {
    let count = 0;

    for (const otherTask of allTasks) {
      const predecessors = otherTask.metadata?.predecessorTaskIds as string[] | undefined;
      if (predecessors && predecessors.includes(task.id)) {
        count++;
        // Recursively count downstream dependencies
        count += this.countDependentTasks(otherTask, allTasks);
      }
    }

    return count;
  }
}
