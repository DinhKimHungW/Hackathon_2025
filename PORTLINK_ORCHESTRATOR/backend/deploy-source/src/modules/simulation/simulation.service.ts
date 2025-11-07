import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Task } from '../tasks/entities/task.entity';
import { Asset } from '../assets/entities/asset.entity';
import { ShipVisit } from '../ship-visits/entities/ship-visit.entity';
import { ConflictDetectionService } from './conflict-detection.service';
import { RecommendationService } from './recommendation.service';
import { WebSocketEventsGateway } from '../websocket/websocket.gateway';
import { CACHE_KEYS, CACHE_TTL } from '../../config/redis.config';
import {
  CreateSimulationDto,
  SimulationResultDto,
  ScenarioType,
  SimulationStatus,
  ConflictDetailDto,
  RecommendationDto,
} from './dto/simulation.dto';

@Injectable()
export class SimulationService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(ShipVisit)
    private shipVisitRepository: Repository<ShipVisit>,
    private dataSource: DataSource,
    private conflictDetectionService: ConflictDetectionService,
    private recommendationService: RecommendationService,
    private websocketGateway: WebSocketEventsGateway,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * Main method: Create and run simulation
   * REQUIREMENT: Execution time < 5 seconds (RQN-001)
   */
  async runSimulation(dto: CreateSimulationDto): Promise<SimulationResultDto> {
    const startTime = Date.now();

    try {
      // Emit simulation started event
      this.websocketGateway.server.emit('simulation:started', {
        name: dto.name,
        scenarioType: dto.scenarioType,
        timestamp: new Date(),
      });

      // Step 1: Validate base schedule exists
      const baseSchedule = await this.scheduleRepository.findOne({
        where: { id: dto.baseScheduleId },
        relations: ['tasks', 'tasks.asset', 'shipVisit'],
      });

      if (!baseSchedule) {
        throw new NotFoundException(`Schedule ${dto.baseScheduleId} not found`);
      }

      // Step 2: Clone schedule and tasks (create simulation scenario)
      const { resultSchedule, clonedTasks } = await this.cloneSchedule(baseSchedule);

      // Step 3: Apply scenario changes
      await this.applyScenarioChanges(dto, resultSchedule, clonedTasks);

      // Step 4: Recalculate schedule (adjust task times based on changes)
      await this.recalculateSchedule(resultSchedule, clonedTasks);

      // Step 5: Detect conflicts
      const conflicts = await this.detectConflicts(resultSchedule, clonedTasks);

      // Step 6: Generate recommendations
      const recommendations = await this.generateRecommendations(conflicts, clonedTasks);

      // Step 7: Calculate metrics
      const metrics = await this.calculateMetrics(baseSchedule, resultSchedule, clonedTasks);

      const executionTimeMs = Date.now() - startTime;

      // Performance check: Must be < 5 seconds
      if (executionTimeMs > 5000) {
        console.warn(`⚠️ Simulation exceeded 5s limit: ${executionTimeMs}ms`);
      }

      // Persist simulation metadata on schedule for future lookups
      resultSchedule.operation = `SIMULATION: ${dto.name}`;
      resultSchedule.notes = JSON.stringify({
        simulation: true,
        name: dto.name,
        description: dto.description,
        baseScheduleId: dto.baseScheduleId,
        scenarioType: dto.scenarioType,
        generatedAt: new Date().toISOString(),
        executionTimeMs,
        conflictsDetected: conflicts.length,
        changes: dto.changes,
        originalNotes: baseSchedule.notes,
      });
      await this.scheduleRepository.save(resultSchedule);

      const result: SimulationResultDto = {
        id: resultSchedule.id,
        name: dto.name,
        status: SimulationStatus.COMPLETED,
        baseScheduleId: dto.baseScheduleId,
        resultScheduleId: resultSchedule.id,
        scenarioType: dto.scenarioType,
        executionTimeMs,
        conflictsDetected: conflicts.length,
        conflicts,
        recommendations,
        metrics,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        createdAt: new Date(),
      };

      // Cache simulation result for 1 hour
      const cacheKey = CACHE_KEYS.SIMULATION_RESULT(resultSchedule.id);
      await this.cacheManager.set(cacheKey, result, CACHE_TTL.SIMULATION_RESULT);
      console.log(`✅ Cached simulation result: ${cacheKey}`);

      // Emit simulation completed event
      this.websocketGateway.server.emit('simulation:completed', result);

      return result;
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      console.error('Simulation failed:', error.message);

      // Emit simulation failed event
      this.websocketGateway.server.emit('simulation:failed', {
        name: dto.name,
        error: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * Step 2: Clone schedule for simulation
   */
  private async cloneSchedule(baseSchedule: Schedule): Promise<{
    resultSchedule: Schedule;
    clonedTasks: Task[];
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Clone schedule
      const resultSchedule = this.scheduleRepository.create({
        shipVisitId: baseSchedule.shipVisitId,
        startTime: baseSchedule.startTime,
        endTime: baseSchedule.endTime,
        status: baseSchedule.status,
        priority: baseSchedule.priority,
        operation: `SIMULATION: ${baseSchedule.operation || 'What-If'}`,
        notes: `Cloned from schedule ${baseSchedule.id}`,
      });

      await queryRunner.manager.save(resultSchedule);

      // Clone all tasks
      const clonedTasks: Task[] = [];
      for (const task of baseSchedule.tasks) {
        const clonedTask = this.taskRepository.create({
          scheduleId: resultSchedule.id,
          assetId: task.assetId,
          taskName: task.taskName,
          taskType: task.taskType,
          status: task.status,
          startTime: task.startTime,
          endTime: task.endTime,
          priority: task.priority,
          assignedTo: task.assignedTo,
          location: task.location,
          estimatedDuration: task.estimatedDuration,
          metadata: task.metadata,
          notes: `Cloned from task ${task.id}`,
        });

        const saved = await queryRunner.manager.save(clonedTask);
        clonedTasks.push(saved);
      }

      await queryRunner.commitTransaction();

      return { resultSchedule, clonedTasks };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Step 3: Apply scenario changes based on type
   */
  private async applyScenarioChanges(
    dto: CreateSimulationDto,
    resultSchedule: Schedule,
    clonedTasks: Task[],
  ): Promise<void> {
    switch (dto.scenarioType) {
      case ScenarioType.SHIP_DELAY:
        await this.applyShipDelayScenario(dto, resultSchedule, clonedTasks);
        break;

      case ScenarioType.ASSET_MAINTENANCE:
        await this.applyAssetMaintenanceScenario(dto, clonedTasks);
        break;

      case ScenarioType.CUSTOM:
        await this.applyCustomScenario(dto, clonedTasks);
        break;

      default:
        throw new BadRequestException(`Unknown scenario type: ${dto.scenarioType}`);
    }
  }

  /**
   * Scenario Handler: Ship Delay
   */
  private async applyShipDelayScenario(
    dto: CreateSimulationDto,
    resultSchedule: Schedule,
    clonedTasks: Task[],
  ): Promise<void> {
    const shipDelayChange = dto.changes.find(
      (c) => c.entityType === 'ship_visit' && c.field === 'etaActual',
    );

    if (!shipDelayChange) {
      throw new BadRequestException('Ship delay scenario requires ship_visit.etaActual change');
    }

    const delayHours = shipDelayChange.newValue; // Assume this is delay in hours
    const delayMs = delayHours * 60 * 60 * 1000;

    // Shift all tasks by delay amount
    for (const task of clonedTasks) {
      task.startTime = new Date(task.startTime.getTime() + delayMs);
      task.endTime = new Date(task.endTime.getTime() + delayMs);
      await this.taskRepository.save(task);
    }

    // Update schedule times
    resultSchedule.startTime = new Date(resultSchedule.startTime.getTime() + delayMs);
    resultSchedule.endTime = new Date(resultSchedule.endTime.getTime() + delayMs);
    await this.scheduleRepository.save(resultSchedule);
  }

  /**
   * Scenario Handler: Asset Maintenance
   */
  private async applyAssetMaintenanceScenario(
    dto: CreateSimulationDto,
    clonedTasks: Task[],
  ): Promise<void> {
    const maintenanceChange = dto.changes.find(
      (c) => c.entityType === 'asset' && c.field === 'maintenanceWindow',
    );

    if (!maintenanceChange) {
      throw new BadRequestException('Asset maintenance scenario requires asset.maintenanceWindow change');
    }

    const { assetId, maintenanceStart, maintenanceDuration } = maintenanceChange.newValue;

    // Find tasks using this asset during maintenance
    const affectedTasks = clonedTasks.filter((t) => t.assetId === assetId);

    for (const task of affectedTasks) {
      const taskStart = task.startTime.getTime();
      const taskEnd = task.endTime.getTime();
      const maintStart = new Date(maintenanceStart).getTime();
      const maintEnd = maintStart + maintenanceDuration * 60 * 60 * 1000;

      // Check if task overlaps with maintenance window
      if (taskStart < maintEnd && taskEnd > maintStart) {
        // Delay task to after maintenance ends
        const delay = maintEnd - taskStart;
        task.startTime = new Date(taskStart + delay);
        task.endTime = new Date(taskEnd + delay);
        task.notes = `${task.notes || ''} [Delayed due to asset maintenance]`;
        await this.taskRepository.save(task);
      }
    }
  }

  /**
   * Scenario Handler: Custom changes
   */
  private async applyCustomScenario(dto: CreateSimulationDto, clonedTasks: Task[]): Promise<void> {
    for (const change of dto.changes) {
      if (change.entityType === 'task') {
        const task = clonedTasks.find((t) => t.id === change.entityId);
        if (task) {
          (task as any)[change.field] = change.newValue;
          await this.taskRepository.save(task);
        }
      }
    }
  }

  /**
   * Step 4: Recalculate schedule
   */
  private async recalculateSchedule(resultSchedule: Schedule, clonedTasks: Task[]): Promise<void> {
    // Update schedule start/end based on earliest/latest task
    if (clonedTasks.length > 0) {
      const startTimes = clonedTasks.map((t) => t.startTime.getTime());
      const endTimes = clonedTasks.map((t) => t.endTime.getTime());

      resultSchedule.startTime = new Date(Math.min(...startTimes));
      resultSchedule.endTime = new Date(Math.max(...endTimes));

      await this.scheduleRepository.save(resultSchedule);
    }
  }

  /**
   * Step 5: Detect conflicts using ConflictDetectionService
   */
  private async detectConflicts(
    resultSchedule: Schedule,
    clonedTasks: Task[],
  ): Promise<ConflictDetailDto[]> {
    return await this.conflictDetectionService.detectAllConflicts(resultSchedule.id, clonedTasks);
  }

  /**
   * Step 6: Generate recommendations using RecommendationService
   */
  private async generateRecommendations(
    conflicts: ConflictDetailDto[],
    clonedTasks: Task[],
  ): Promise<RecommendationDto[]> {
    return await this.recommendationService.generateRecommendations(conflicts, clonedTasks);
  }

  /**
   * Step 7: Calculate metrics
   */
  private async calculateMetrics(
    baseSchedule: Schedule,
    resultSchedule: Schedule,
    clonedTasks: Task[],
  ): Promise<any> {
    const affectedTasks = clonedTasks.filter((t) => 
      t.notes?.includes('Delayed') || t.notes?.includes('maintenance')
    ).length;

    // Calculate total delay
    let totalDelayHours = 0;
    const baseScheduleDurationHours = 
      (baseSchedule.endTime.getTime() - baseSchedule.startTime.getTime()) / (1000 * 60 * 60);
    const resultScheduleDurationHours = 
      (resultSchedule.endTime.getTime() - resultSchedule.startTime.getTime()) / (1000 * 60 * 60);
    
    totalDelayHours = Math.max(0, resultScheduleDurationHours - baseScheduleDurationHours);

    return {
      totalTasks: clonedTasks.length,
      affectedTasks,
      totalDelayHours: Math.round(totalDelayHours * 10) / 10,
      resourceUtilizationBefore: 85, // Placeholder
      resourceUtilizationAfter: 82, // Placeholder
    };
  }

  /**
   * Get simulation result by ID (with Redis cache)
   */
  async getSimulationResult(simulationId: string): Promise<SimulationResultDto> {
    // Try cache first
    const cacheKey = CACHE_KEYS.SIMULATION_RESULT(simulationId);
    const cached = await this.cacheManager.get<SimulationResultDto>(cacheKey);
    
    if (cached) {
      console.log(`✅ Cache HIT for simulation ${simulationId}`);
      return cached;
    }

    console.log(`❌ Cache MISS for simulation ${simulationId}`);

    const schedule = await this.scheduleRepository.findOne({
      where: { id: simulationId },
      relations: ['tasks', 'tasks.asset'],
    });

    if (!schedule) {
      throw new NotFoundException(`Simulation ${simulationId} not found`);
    }

    const result = await this.buildSimulationResultFromSchedule(schedule);

    // Cache result for 1 hour
    await this.cacheManager.set(cacheKey, result, CACHE_TTL.SIMULATION_RESULT);

    return result;
  }

  /**
   * Apply simulation: Activate the result schedule
   */
  async applySimulation(simulationId: string): Promise<{ success: boolean; message: string }> {
    const resultSchedule = await this.scheduleRepository.findOne({
      where: { id: simulationId },
    });

    if (!resultSchedule) {
      throw new NotFoundException(`Simulation ${simulationId} not found`);
    }

    // Update schedule operation to remove "SIMULATION:" prefix
    resultSchedule.operation = resultSchedule.operation?.replace('SIMULATION: ', '') || 'Active Schedule';
    await this.scheduleRepository.save(resultSchedule);

    return {
      success: true,
      message: 'Simulation applied successfully. Schedule is now active.',
    };
  }

  async listRecentSimulations(limit = 10): Promise<SimulationResultDto[]> {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const simulationSchedules = await this.scheduleRepository.find({
      where: { operation: Like('SIMULATION:%') },
      order: { createdAt: 'DESC' },
      take: safeLimit,
      relations: ['tasks', 'tasks.asset'],
    });

    const results: SimulationResultDto[] = [];

    for (const schedule of simulationSchedules) {
      const cacheKey = CACHE_KEYS.SIMULATION_RESULT(schedule.id);
      const cached = await this.cacheManager.get<SimulationResultDto>(cacheKey);
      if (cached) {
        results.push(cached);
        continue;
      }

      const result = await this.buildSimulationResultFromSchedule(schedule);
      await this.cacheManager.set(cacheKey, result, CACHE_TTL.SIMULATION_RESULT);
      results.push(result);
    }

    return results;
  }

  async deleteSimulation(simulationId: string): Promise<{ success: boolean; message: string }> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: simulationId },
    });

    if (!schedule) {
      throw new NotFoundException(`Simulation ${simulationId} not found`);
    }

    if (!schedule.operation?.startsWith('SIMULATION')) {
      throw new BadRequestException('The specified schedule is not a simulation clone.');
    }

    await this.scheduleRepository.remove(schedule);

    const cacheKey = CACHE_KEYS.SIMULATION_RESULT(simulationId);
    await this.cacheManager.del(cacheKey);

    return {
      success: true,
      message: 'Simulation deleted successfully.',
    };
  }

  private extractSimulationMetadata(schedule: Schedule): {
    baseScheduleId: string;
    scenarioType: ScenarioType;
    executionTimeMs: number;
    conflictsDetected: number;
    name: string;
    description?: string;
    changes?: CreateSimulationDto['changes'];
  } {
    const defaultMeta = {
      baseScheduleId: 'unknown',
      scenarioType: ScenarioType.CUSTOM,
      executionTimeMs: schedule.actualDuration ?? 0,
      conflictsDetected: 0,
      name: schedule.operation?.replace(/^SIMULATION:\s*/i, '')?.trim() || schedule.operation || 'Simulation',
      description: undefined,
      changes: undefined,
    };

    if (!schedule.notes) {
      return defaultMeta;
    }

    try {
      const parsed = JSON.parse(schedule.notes);
      if (parsed?.simulation) {
        const parsedScenarioType = Object.values(ScenarioType).includes(parsed.scenarioType as ScenarioType)
          ? (parsed.scenarioType as ScenarioType)
          : ScenarioType.CUSTOM;

        return {
          baseScheduleId: parsed.baseScheduleId ?? defaultMeta.baseScheduleId,
          scenarioType: parsedScenarioType,
          executionTimeMs: parsed.executionTimeMs ?? defaultMeta.executionTimeMs,
          conflictsDetected: parsed.conflictsDetected ?? defaultMeta.conflictsDetected,
          name: typeof parsed.name === 'string' && parsed.name.trim().length > 0
            ? parsed.name.trim()
            : defaultMeta.name,
          description: typeof parsed.description === 'string' ? parsed.description : defaultMeta.description,
          changes: Array.isArray(parsed.changes) ? parsed.changes : defaultMeta.changes,
        };
      }
    } catch (error) {
      // fall through to regex-based inference
    }

    const match = schedule.notes.match(/schedule\s+([a-f0-9-]+)/i);
    if (match?.[1]) {
      return {
        ...defaultMeta,
        baseScheduleId: match[1],
      };
    }

    return defaultMeta;
  }

  private async buildSimulationResultFromSchedule(schedule: Schedule): Promise<SimulationResultDto> {
    const metadata = this.extractSimulationMetadata(schedule);

    let metrics: SimulationResultDto['metrics'] = {
      totalTasks: schedule.tasks?.length || 0,
      affectedTasks: 0,
      totalDelayHours: 0,
      resourceUtilizationBefore: 0,
      resourceUtilizationAfter: 0,
    };

    if (metadata.baseScheduleId !== 'unknown') {
      const baseSchedule = await this.scheduleRepository.findOne({
        where: { id: metadata.baseScheduleId },
        relations: ['tasks', 'tasks.asset'],
      });

      if (baseSchedule) {
        metrics = await this.calculateMetrics(baseSchedule, schedule, schedule.tasks ?? []);
      }
    }

    const scenarioType = Object.values(ScenarioType).includes(metadata.scenarioType as ScenarioType)
      ? (metadata.scenarioType as ScenarioType)
      : ScenarioType.CUSTOM;

    return {
      id: schedule.id,
      name: metadata.name,
      status: SimulationStatus.COMPLETED,
      baseScheduleId: metadata.baseScheduleId,
      resultScheduleId: schedule.id,
      scenarioType,
      executionTimeMs: metadata.executionTimeMs,
      conflictsDetected: metadata.conflictsDetected,
      conflicts: [],
      recommendations: [],
      metrics,
      startedAt: schedule.createdAt,
      completedAt: schedule.updatedAt ?? schedule.createdAt,
      createdAt: schedule.createdAt,
    };
  }
}
