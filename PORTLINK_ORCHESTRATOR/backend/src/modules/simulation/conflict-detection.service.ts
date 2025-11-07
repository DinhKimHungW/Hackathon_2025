import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Asset, AssetType } from '../assets/entities/asset.entity';
import { ShipVisit } from '../ship-visits/entities/ship-visit.entity';
import { ConflictDetailDto } from './dto/simulation.dto';

export enum ConflictType {
  RESOURCE_DOUBLE_BOOKING = 'RESOURCE_DOUBLE_BOOKING',
  CAPACITY_EXCEEDED = 'CAPACITY_EXCEEDED',
  TIME_CONSTRAINT_VIOLATION = 'TIME_CONSTRAINT_VIOLATION',
  DEPENDENCY_VIOLATION = 'DEPENDENCY_VIOLATION',
}

export enum ConflictSeverity {
  CRITICAL = 'CRITICAL', // Blocking issue - ship cannot berth
  HIGH = 'HIGH',         // Significant delay > 4 hours
  MEDIUM = 'MEDIUM',     // Moderate delay 1-4 hours
  LOW = 'LOW',           // Minor adjustment < 1 hour
}

@Injectable()
export class ConflictDetectionService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(ShipVisit)
    private shipVisitRepository: Repository<ShipVisit>,
  ) {}

  /**
   * Detect all conflicts in a schedule
   */
  async detectAllConflicts(scheduleId: string, tasks: Task[]): Promise<ConflictDetailDto[]> {
    const conflicts: ConflictDetailDto[] = [];

    // 1. Detect RESOURCE_DOUBLE_BOOKING
    const doubleBookingConflicts = await this.detectResourceDoubleBooking(tasks);
    conflicts.push(...doubleBookingConflicts);

    // 2. Detect CAPACITY_EXCEEDED
    const capacityConflicts = await this.detectCapacityExceeded(tasks);
    conflicts.push(...capacityConflicts);

    // 3. Detect TIME_CONSTRAINT_VIOLATION
    const timeConstraintConflicts = await this.detectTimeConstraintViolations(tasks);
    conflicts.push(...timeConstraintConflicts);

    // 4. Detect DEPENDENCY_VIOLATION
    const dependencyConflicts = await this.detectDependencyViolations(tasks);
    conflicts.push(...dependencyConflicts);

    return conflicts;
  }

  /**
   * Conflict Type 1: RESOURCE_DOUBLE_BOOKING
   * Detect when same asset (berth/crane) is assigned to multiple tasks with overlapping times
   */
  private async detectResourceDoubleBooking(tasks: Task[]): Promise<ConflictDetailDto[]> {
    const conflicts: ConflictDetailDto[] = [];

    // Group tasks by assetId
    const tasksByAsset = new Map<string, Task[]>();
    for (const task of tasks) {
      if (task.assetId) {
        if (!tasksByAsset.has(task.assetId)) {
          tasksByAsset.set(task.assetId, []);
        }
        tasksByAsset.get(task.assetId)!.push(task);
      }
    }

    // Check for time overlaps within each asset group
    for (const [assetId, assetTasks] of tasksByAsset) {
      const asset = await this.assetRepository.findOne({ where: { id: assetId } });

      for (let i = 0; i < assetTasks.length; i++) {
        for (let j = i + 1; j < assetTasks.length; j++) {
          const task1 = assetTasks[i];
          const task2 = assetTasks[j];

          // Check overlap: (start1 < end2) AND (start2 < end1)
          if (this.isTimeOverlap(task1.startTime, task1.endTime, task2.startTime, task2.endTime)) {
            const overlapDurationHours = this.calculateOverlapDuration(
              task1.startTime,
              task1.endTime,
              task2.startTime,
              task2.endTime,
            );

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

  /**
   * Conflict Type 2: CAPACITY_EXCEEDED
   * Detect when asset capacity is insufficient for task requirements
   */
  private async detectCapacityExceeded(tasks: Task[]): Promise<ConflictDetailDto[]> {
    const conflicts: ConflictDetailDto[] = [];

    for (const task of tasks) {
      if (!task.assetId || !task.scheduleId) continue;

      const asset = await this.assetRepository.findOne({ where: { id: task.assetId } });
      if (!asset) continue;

      // Get ship visit to check vessel specifications
      const schedule = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.schedule', 'schedule')
        .leftJoinAndSelect('schedule.shipVisit', 'shipVisit')
        .where('task.id = :taskId', { taskId: task.id })
        .getOne();

      const shipVisit = schedule?.schedule?.shipVisit;
      if (!shipVisit) continue;

      // Check capacity based on asset specifications
      // Note: Current entities don't have BERTH type, using generic capacity checks
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

      // Check crane capacity
      if (asset.type === AssetType.CRANE) {
        const craneCapacity = asset.specifications?.craneCapacity;
        const cargoWeight = shipVisit.totalContainers; // Use containers as weight proxy

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

  /**
   * Conflict Type 3: TIME_CONSTRAINT_VIOLATION
   * Detect when tasks violate time constraints (e.g., task before ship arrival)
   */
  private async detectTimeConstraintViolations(tasks: Task[]): Promise<ConflictDetailDto[]> {
    const conflicts: ConflictDetailDto[] = [];

    for (const task of tasks) {
      if (!task.scheduleId) continue;

      // Get ship visit ETA
      const schedule = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.schedule', 'schedule')
        .leftJoinAndSelect('schedule.shipVisit', 'shipVisit')
        .where('task.id = :taskId', { taskId: task.id })
        .getOne();

      const shipVisit = schedule?.schedule?.shipVisit;
      if (!shipVisit) continue;

      const eta = shipVisit.ata || shipVisit.eta; // Actual or estimated arrival

      // Check if task starts before ship arrives
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

      // Check if task extends beyond reasonable working hours (optional - for maintenance windows)
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

  /**
   * Conflict Type 4: DEPENDENCY_VIOLATION
   * Detect when task dependencies are violated (predecessor must complete before successor)
   */
  private async detectDependencyViolations(tasks: Task[]): Promise<ConflictDetailDto[]> {
    const conflicts: ConflictDetailDto[] = [];

    for (const task of tasks) {
      // Check if task has dependencies in metadata
      const predecessorTaskIds = task.metadata?.predecessorTaskIds as string[] | undefined;

      if (predecessorTaskIds && predecessorTaskIds.length > 0) {
        for (const predecessorId of predecessorTaskIds) {
          const predecessor = tasks.find((t) => t.id === predecessorId);

          if (predecessor) {
            // Successor must start after predecessor ends
            if (task.startTime < predecessor.endTime) {
              const violationHours =
                (predecessor.endTime.getTime() - task.startTime.getTime()) / (1000 * 60 * 60);

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

  /**
   * Helper: Check if two time ranges overlap
   */
  private isTimeOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && start2 < end1;
  }

  /**
   * Helper: Calculate overlap duration in hours
   */
  private calculateOverlapDuration(start1: Date, end1: Date, start2: Date, end2: Date): number {
    const overlapStart = Math.max(start1.getTime(), start2.getTime());
    const overlapEnd = Math.min(end1.getTime(), end2.getTime());
    return (overlapEnd - overlapStart) / (1000 * 60 * 60);
  }

  /**
   * Helper: Calculate conflict severity based on duration
   */
  private calculateSeverity(durationHours: number): ConflictSeverity {
    if (durationHours >= 8) return ConflictSeverity.CRITICAL;
    if (durationHours >= 4) return ConflictSeverity.HIGH;
    if (durationHours >= 1) return ConflictSeverity.MEDIUM;
    return ConflictSeverity.LOW;
  }
}
