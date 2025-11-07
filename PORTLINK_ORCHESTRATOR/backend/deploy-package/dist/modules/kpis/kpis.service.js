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
exports.KpisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ship_visit_entity_1 = require("../ship-visits/entities/ship-visit.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const asset_entity_1 = require("../assets/entities/asset.entity");
const schedule_entity_1 = require("../schedules/entities/schedule.entity");
let KpisService = class KpisService {
    constructor(shipVisitRepository, taskRepository, assetRepository, scheduleRepository) {
        this.shipVisitRepository = shipVisitRepository;
        this.taskRepository = taskRepository;
        this.assetRepository = assetRepository;
        this.scheduleRepository = scheduleRepository;
    }
    async getSummary() {
        const [ships, tasks, assets, schedules] = await Promise.all([
            this.getShipKPIs(),
            this.getTaskKPIs(),
            this.getAssetKPIs(),
            this.getScheduleKPIs(),
        ]);
        return {
            ships,
            tasks,
            assets,
            schedules,
            lastUpdated: new Date(),
        };
    }
    async getShipKPIs() {
        const [total, scheduled, arrived, inProgress, completed, departed] = await Promise.all([
            this.shipVisitRepository.count(),
            this.shipVisitRepository.count({ where: { status: ship_visit_entity_1.ShipVisitStatus.PLANNED } }),
            this.shipVisitRepository.count({ where: { status: ship_visit_entity_1.ShipVisitStatus.ARRIVED } }),
            this.shipVisitRepository.count({ where: { status: ship_visit_entity_1.ShipVisitStatus.IN_PROGRESS } }),
            this.shipVisitRepository.count({ where: { status: ship_visit_entity_1.ShipVisitStatus.COMPLETED } }),
            this.shipVisitRepository.count({ where: { status: ship_visit_entity_1.ShipVisitStatus.DEPARTED } }),
        ]);
        const ships = await this.shipVisitRepository.find({
            where: { status: ship_visit_entity_1.ShipVisitStatus.COMPLETED },
        });
        let averageBerthTime = 0;
        if (ships.length > 0) {
            const totalBerthTime = ships.reduce((sum, ship) => {
                if (ship.ata && ship.atd) {
                    const arrivalTime = new Date(ship.ata).getTime();
                    const departureTime = new Date(ship.atd).getTime();
                    return sum + (departureTime - arrivalTime) / (1000 * 60 * 60);
                }
                return sum;
            }, 0);
            averageBerthTime = totalBerthTime / ships.length;
        }
        return {
            total,
            scheduled,
            berthing: arrived,
            loading: inProgress,
            departing: departed,
            delayed: 0,
            averageBerthTime: Math.round(averageBerthTime * 10) / 10,
        };
    }
    async getTaskKPIs() {
        const [total, inProgress, completed, failed] = await Promise.all([
            this.taskRepository.count(),
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.IN_PROGRESS } }),
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.COMPLETED } }),
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.FAILED } }),
        ]);
        const completionRate = total > 0 ? (completed / total) * 100 : 0;
        const [loading, unloading, maintenance, inspection] = await Promise.all([
            this.taskRepository.count({ where: { taskType: task_entity_1.TaskType.LOADING } }),
            this.taskRepository.count({ where: { taskType: task_entity_1.TaskType.UNLOADING } }),
            this.taskRepository.count({ where: { taskType: task_entity_1.TaskType.MAINTENANCE } }),
            this.taskRepository.count({ where: { taskType: task_entity_1.TaskType.INSPECTION } }),
        ]);
        const [pending, assigned, inProgressStatus, completedStatus, cancelled] = await Promise.all([
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.PENDING } }),
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.ASSIGNED } }),
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.IN_PROGRESS } }),
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.COMPLETED } }),
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.CANCELLED } }),
        ]);
        return {
            total,
            active: inProgress,
            completed,
            overdue: failed,
            completionRate: Math.round(completionRate * 10) / 10,
            byType: {
                LOADING: loading,
                UNLOADING: unloading,
                MAINTENANCE: maintenance,
                INSPECTION: inspection,
            },
            byStatus: {
                PENDING: pending,
                ACTIVE: assigned + inProgressStatus,
                COMPLETED: completedStatus,
                CANCELLED: cancelled,
            },
        };
    }
    async getAssetKPIs() {
        const [total, available, inUse, maintenance] = await Promise.all([
            this.assetRepository.count(),
            this.assetRepository.count({ where: { status: asset_entity_1.AssetStatus.AVAILABLE } }),
            this.assetRepository.count({ where: { status: asset_entity_1.AssetStatus.IN_USE } }),
            this.assetRepository.count({ where: { status: asset_entity_1.AssetStatus.MAINTENANCE } }),
        ]);
        const utilizationRate = total > 0 ? (inUse / total) * 100 : 0;
        const [crane, forklift, truck, other] = await Promise.all([
            this.assetRepository.count({ where: { type: asset_entity_1.AssetType.CRANE } }),
            this.assetRepository.count({ where: { type: asset_entity_1.AssetType.FORKLIFT } }),
            this.assetRepository.count({ where: { type: asset_entity_1.AssetType.TRUCK } }),
            this.assetRepository.count({ where: { type: asset_entity_1.AssetType.OTHER } }),
        ]);
        const [availableStatus, inUseStatus, maintenanceStatus, offline] = await Promise.all([
            this.assetRepository.count({ where: { status: asset_entity_1.AssetStatus.AVAILABLE } }),
            this.assetRepository.count({ where: { status: asset_entity_1.AssetStatus.IN_USE } }),
            this.assetRepository.count({ where: { status: asset_entity_1.AssetStatus.MAINTENANCE } }),
            this.assetRepository.count({ where: { status: asset_entity_1.AssetStatus.OFFLINE } }),
        ]);
        return {
            total,
            available,
            inUse,
            maintenance,
            utilizationRate: Math.round(utilizationRate * 10) / 10,
            byType: {
                CRANE: crane,
                FORKLIFT: forklift,
                TRUCK: truck,
                CONTAINER: other,
            },
            byStatus: {
                AVAILABLE: availableStatus,
                IN_USE: inUseStatus,
                MAINTENANCE: maintenanceStatus,
                OUT_OF_SERVICE: offline,
            },
        };
    }
    async getScheduleKPIs() {
        const [total, inProgress, pending, completed] = await Promise.all([
            this.scheduleRepository.count(),
            this.scheduleRepository.count({ where: { status: schedule_entity_1.ScheduleStatus.IN_PROGRESS } }),
            this.scheduleRepository.count({ where: { status: schedule_entity_1.ScheduleStatus.PENDING } }),
            this.scheduleRepository.count({ where: { status: schedule_entity_1.ScheduleStatus.COMPLETED } }),
        ]);
        const completionRate = total > 0 ? (completed / total) * 100 : 0;
        const conflictsDetected = 0;
        return {
            total,
            active: inProgress,
            pending,
            completed,
            completionRate: Math.round(completionRate * 10) / 10,
            conflictsDetected,
        };
    }
    async getShipArrivals(days = 7) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const ships = await this.shipVisitRepository.find({
            where: {
                eta: (0, typeorm_2.Between)(startDate, endDate),
            },
            order: { eta: 'ASC' },
        });
        const dataMap = new Map();
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dataMap.set(dateStr, {
                date: dateStr,
                count: 0,
                arrivals: 0,
                departures: 0,
            });
        }
        ships.forEach((ship) => {
            const dateStr = new Date(ship.eta).toISOString().split('T')[0];
            const data = dataMap.get(dateStr);
            if (data) {
                data.arrivals++;
                data.count++;
            }
        });
        return Array.from(dataMap.values());
    }
    async getTaskStatus() {
        const [pending, inProgress, completed, cancelled] = await Promise.all([
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.PENDING } }),
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.IN_PROGRESS } }),
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.COMPLETED } }),
            this.taskRepository.count({ where: { status: task_entity_1.TaskStatus.CANCELLED } }),
        ]);
        const total = pending + inProgress + completed + cancelled;
        const colors = {
            PENDING: '#ffa726',
            IN_PROGRESS: '#42a5f5',
            COMPLETED: '#66bb6a',
            CANCELLED: '#ef5350',
        };
        return [
            {
                status: 'PENDING',
                count: pending,
                percentage: total > 0 ? Math.round((pending / total) * 100) : 0,
                color: colors.PENDING,
            },
            {
                status: 'IN_PROGRESS',
                count: inProgress,
                percentage: total > 0 ? Math.round((inProgress / total) * 100) : 0,
                color: colors.IN_PROGRESS,
            },
            {
                status: 'COMPLETED',
                count: completed,
                percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
                color: colors.COMPLETED,
            },
            {
                status: 'CANCELLED',
                count: cancelled,
                percentage: total > 0 ? Math.round((cancelled / total) * 100) : 0,
                color: colors.CANCELLED,
            },
        ];
    }
    async getAssetUtilization() {
        const types = [asset_entity_1.AssetType.CRANE, asset_entity_1.AssetType.FORKLIFT, asset_entity_1.AssetType.TRUCK, asset_entity_1.AssetType.OTHER];
        const result = [];
        for (const type of types) {
            const [total, available, inUse] = await Promise.all([
                this.assetRepository.count({ where: { type } }),
                this.assetRepository.count({ where: { type, status: asset_entity_1.AssetStatus.AVAILABLE } }),
                this.assetRepository.count({ where: { type, status: asset_entity_1.AssetStatus.IN_USE } }),
            ]);
            const utilizationRate = total > 0 ? (inUse / total) * 100 : 0;
            result.push({
                type: type.toString(),
                total,
                available,
                inUse,
                utilizationRate: Math.round(utilizationRate * 10) / 10,
            });
        }
        return result;
    }
    async getScheduleTimeline(days = 7) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const schedules = await this.scheduleRepository.find({
            where: {
                startTime: (0, typeorm_2.Between)(startDate, endDate),
            },
            order: { startTime: 'ASC' },
        });
        const dataMap = new Map();
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dataMap.set(dateStr, {
                date: dateStr,
                scheduled: 0,
                active: 0,
                completed: 0,
            });
        }
        schedules.forEach((schedule) => {
            const dateStr = new Date(schedule.startTime).toISOString().split('T')[0];
            const data = dataMap.get(dateStr);
            if (data) {
                if (schedule.status === schedule_entity_1.ScheduleStatus.PENDING || schedule.status === schedule_entity_1.ScheduleStatus.SCHEDULED) {
                    data.scheduled++;
                }
                if (schedule.status === schedule_entity_1.ScheduleStatus.IN_PROGRESS)
                    data.active++;
                if (schedule.status === schedule_entity_1.ScheduleStatus.COMPLETED)
                    data.completed++;
            }
        });
        return Array.from(dataMap.values());
    }
    async refresh() {
        return {
            message: 'KPI refresh triggered successfully',
            timestamp: new Date(),
        };
    }
};
exports.KpisService = KpisService;
exports.KpisService = KpisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ship_visit_entity_1.ShipVisit)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(2, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __param(3, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], KpisService);
//# sourceMappingURL=kpis.service.js.map