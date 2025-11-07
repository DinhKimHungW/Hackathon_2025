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
exports.SimulationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const schedule_entity_1 = require("../schedules/entities/schedule.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const asset_entity_1 = require("../assets/entities/asset.entity");
const ship_visit_entity_1 = require("../ship-visits/entities/ship-visit.entity");
const conflict_detection_service_1 = require("./conflict-detection.service");
const recommendation_service_1 = require("./recommendation.service");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const redis_config_1 = require("../../config/redis.config");
const simulation_dto_1 = require("./dto/simulation.dto");
let SimulationService = class SimulationService {
    constructor(scheduleRepository, taskRepository, assetRepository, shipVisitRepository, dataSource, conflictDetectionService, recommendationService, websocketGateway, cacheManager) {
        this.scheduleRepository = scheduleRepository;
        this.taskRepository = taskRepository;
        this.assetRepository = assetRepository;
        this.shipVisitRepository = shipVisitRepository;
        this.dataSource = dataSource;
        this.conflictDetectionService = conflictDetectionService;
        this.recommendationService = recommendationService;
        this.websocketGateway = websocketGateway;
        this.cacheManager = cacheManager;
    }
    async runSimulation(dto) {
        const startTime = Date.now();
        try {
            this.websocketGateway.server.emit('simulation:started', {
                name: dto.name,
                scenarioType: dto.scenarioType,
                timestamp: new Date(),
            });
            const baseSchedule = await this.scheduleRepository.findOne({
                where: { id: dto.baseScheduleId },
                relations: ['tasks', 'tasks.asset', 'shipVisit'],
            });
            if (!baseSchedule) {
                throw new common_1.NotFoundException(`Schedule ${dto.baseScheduleId} not found`);
            }
            const { resultSchedule, clonedTasks } = await this.cloneSchedule(baseSchedule);
            await this.applyScenarioChanges(dto, resultSchedule, clonedTasks);
            await this.recalculateSchedule(resultSchedule, clonedTasks);
            const conflicts = await this.detectConflicts(resultSchedule, clonedTasks);
            const recommendations = await this.generateRecommendations(conflicts, clonedTasks);
            const metrics = await this.calculateMetrics(baseSchedule, resultSchedule, clonedTasks);
            const executionTimeMs = Date.now() - startTime;
            if (executionTimeMs > 5000) {
                console.warn(`⚠️ Simulation exceeded 5s limit: ${executionTimeMs}ms`);
            }
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
            const result = {
                id: resultSchedule.id,
                name: dto.name,
                status: simulation_dto_1.SimulationStatus.COMPLETED,
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
            const cacheKey = redis_config_1.CACHE_KEYS.SIMULATION_RESULT(resultSchedule.id);
            await this.cacheManager.set(cacheKey, result, redis_config_1.CACHE_TTL.SIMULATION_RESULT);
            console.log(`✅ Cached simulation result: ${cacheKey}`);
            this.websocketGateway.server.emit('simulation:completed', result);
            return result;
        }
        catch (error) {
            const executionTimeMs = Date.now() - startTime;
            console.error('Simulation failed:', error.message);
            this.websocketGateway.server.emit('simulation:failed', {
                name: dto.name,
                error: error.message,
                timestamp: new Date(),
            });
            throw error;
        }
    }
    async cloneSchedule(baseSchedule) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
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
            const clonedTasks = [];
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async applyScenarioChanges(dto, resultSchedule, clonedTasks) {
        switch (dto.scenarioType) {
            case simulation_dto_1.ScenarioType.SHIP_DELAY:
                await this.applyShipDelayScenario(dto, resultSchedule, clonedTasks);
                break;
            case simulation_dto_1.ScenarioType.ASSET_MAINTENANCE:
                await this.applyAssetMaintenanceScenario(dto, clonedTasks);
                break;
            case simulation_dto_1.ScenarioType.CUSTOM:
                await this.applyCustomScenario(dto, clonedTasks);
                break;
            default:
                throw new common_1.BadRequestException(`Unknown scenario type: ${dto.scenarioType}`);
        }
    }
    async applyShipDelayScenario(dto, resultSchedule, clonedTasks) {
        const shipDelayChange = dto.changes.find((c) => c.entityType === 'ship_visit' && c.field === 'etaActual');
        if (!shipDelayChange) {
            throw new common_1.BadRequestException('Ship delay scenario requires ship_visit.etaActual change');
        }
        const delayHours = shipDelayChange.newValue;
        const delayMs = delayHours * 60 * 60 * 1000;
        for (const task of clonedTasks) {
            task.startTime = new Date(task.startTime.getTime() + delayMs);
            task.endTime = new Date(task.endTime.getTime() + delayMs);
            await this.taskRepository.save(task);
        }
        resultSchedule.startTime = new Date(resultSchedule.startTime.getTime() + delayMs);
        resultSchedule.endTime = new Date(resultSchedule.endTime.getTime() + delayMs);
        await this.scheduleRepository.save(resultSchedule);
    }
    async applyAssetMaintenanceScenario(dto, clonedTasks) {
        const maintenanceChange = dto.changes.find((c) => c.entityType === 'asset' && c.field === 'maintenanceWindow');
        if (!maintenanceChange) {
            throw new common_1.BadRequestException('Asset maintenance scenario requires asset.maintenanceWindow change');
        }
        const { assetId, maintenanceStart, maintenanceDuration } = maintenanceChange.newValue;
        const affectedTasks = clonedTasks.filter((t) => t.assetId === assetId);
        for (const task of affectedTasks) {
            const taskStart = task.startTime.getTime();
            const taskEnd = task.endTime.getTime();
            const maintStart = new Date(maintenanceStart).getTime();
            const maintEnd = maintStart + maintenanceDuration * 60 * 60 * 1000;
            if (taskStart < maintEnd && taskEnd > maintStart) {
                const delay = maintEnd - taskStart;
                task.startTime = new Date(taskStart + delay);
                task.endTime = new Date(taskEnd + delay);
                task.notes = `${task.notes || ''} [Delayed due to asset maintenance]`;
                await this.taskRepository.save(task);
            }
        }
    }
    async applyCustomScenario(dto, clonedTasks) {
        for (const change of dto.changes) {
            if (change.entityType === 'task') {
                const task = clonedTasks.find((t) => t.id === change.entityId);
                if (task) {
                    task[change.field] = change.newValue;
                    await this.taskRepository.save(task);
                }
            }
        }
    }
    async recalculateSchedule(resultSchedule, clonedTasks) {
        if (clonedTasks.length > 0) {
            const startTimes = clonedTasks.map((t) => t.startTime.getTime());
            const endTimes = clonedTasks.map((t) => t.endTime.getTime());
            resultSchedule.startTime = new Date(Math.min(...startTimes));
            resultSchedule.endTime = new Date(Math.max(...endTimes));
            await this.scheduleRepository.save(resultSchedule);
        }
    }
    async detectConflicts(resultSchedule, clonedTasks) {
        return await this.conflictDetectionService.detectAllConflicts(resultSchedule.id, clonedTasks);
    }
    async generateRecommendations(conflicts, clonedTasks) {
        return await this.recommendationService.generateRecommendations(conflicts, clonedTasks);
    }
    async calculateMetrics(baseSchedule, resultSchedule, clonedTasks) {
        const affectedTasks = clonedTasks.filter((t) => t.notes?.includes('Delayed') || t.notes?.includes('maintenance')).length;
        let totalDelayHours = 0;
        const baseScheduleDurationHours = (baseSchedule.endTime.getTime() - baseSchedule.startTime.getTime()) / (1000 * 60 * 60);
        const resultScheduleDurationHours = (resultSchedule.endTime.getTime() - resultSchedule.startTime.getTime()) / (1000 * 60 * 60);
        totalDelayHours = Math.max(0, resultScheduleDurationHours - baseScheduleDurationHours);
        return {
            totalTasks: clonedTasks.length,
            affectedTasks,
            totalDelayHours: Math.round(totalDelayHours * 10) / 10,
            resourceUtilizationBefore: 85,
            resourceUtilizationAfter: 82,
        };
    }
    async getSimulationResult(simulationId) {
        const cacheKey = redis_config_1.CACHE_KEYS.SIMULATION_RESULT(simulationId);
        const cached = await this.cacheManager.get(cacheKey);
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
            throw new common_1.NotFoundException(`Simulation ${simulationId} not found`);
        }
        const result = await this.buildSimulationResultFromSchedule(schedule);
        await this.cacheManager.set(cacheKey, result, redis_config_1.CACHE_TTL.SIMULATION_RESULT);
        return result;
    }
    async applySimulation(simulationId) {
        const resultSchedule = await this.scheduleRepository.findOne({
            where: { id: simulationId },
        });
        if (!resultSchedule) {
            throw new common_1.NotFoundException(`Simulation ${simulationId} not found`);
        }
        resultSchedule.operation = resultSchedule.operation?.replace('SIMULATION: ', '') || 'Active Schedule';
        await this.scheduleRepository.save(resultSchedule);
        return {
            success: true,
            message: 'Simulation applied successfully. Schedule is now active.',
        };
    }
    async listRecentSimulations(limit = 10) {
        const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
        const simulationSchedules = await this.scheduleRepository.find({
            where: { operation: (0, typeorm_2.Like)('SIMULATION:%') },
            order: { createdAt: 'DESC' },
            take: safeLimit,
            relations: ['tasks', 'tasks.asset'],
        });
        const results = [];
        for (const schedule of simulationSchedules) {
            const cacheKey = redis_config_1.CACHE_KEYS.SIMULATION_RESULT(schedule.id);
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                results.push(cached);
                continue;
            }
            const result = await this.buildSimulationResultFromSchedule(schedule);
            await this.cacheManager.set(cacheKey, result, redis_config_1.CACHE_TTL.SIMULATION_RESULT);
            results.push(result);
        }
        return results;
    }
    async deleteSimulation(simulationId) {
        const schedule = await this.scheduleRepository.findOne({
            where: { id: simulationId },
        });
        if (!schedule) {
            throw new common_1.NotFoundException(`Simulation ${simulationId} not found`);
        }
        if (!schedule.operation?.startsWith('SIMULATION')) {
            throw new common_1.BadRequestException('The specified schedule is not a simulation clone.');
        }
        await this.scheduleRepository.remove(schedule);
        const cacheKey = redis_config_1.CACHE_KEYS.SIMULATION_RESULT(simulationId);
        await this.cacheManager.del(cacheKey);
        return {
            success: true,
            message: 'Simulation deleted successfully.',
        };
    }
    extractSimulationMetadata(schedule) {
        const defaultMeta = {
            baseScheduleId: 'unknown',
            scenarioType: simulation_dto_1.ScenarioType.CUSTOM,
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
                const parsedScenarioType = Object.values(simulation_dto_1.ScenarioType).includes(parsed.scenarioType)
                    ? parsed.scenarioType
                    : simulation_dto_1.ScenarioType.CUSTOM;
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
        }
        catch (error) {
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
    async buildSimulationResultFromSchedule(schedule) {
        const metadata = this.extractSimulationMetadata(schedule);
        let metrics = {
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
        const scenarioType = Object.values(simulation_dto_1.ScenarioType).includes(metadata.scenarioType)
            ? metadata.scenarioType
            : simulation_dto_1.ScenarioType.CUSTOM;
        return {
            id: schedule.id,
            name: metadata.name,
            status: simulation_dto_1.SimulationStatus.COMPLETED,
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
};
exports.SimulationService = SimulationService;
exports.SimulationService = SimulationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(2, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __param(3, (0, typeorm_1.InjectRepository)(ship_visit_entity_1.ShipVisit)),
    __param(8, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        conflict_detection_service_1.ConflictDetectionService,
        recommendation_service_1.RecommendationService,
        websocket_gateway_1.WebSocketEventsGateway, Object])
], SimulationService);
//# sourceMappingURL=simulation.service.js.map