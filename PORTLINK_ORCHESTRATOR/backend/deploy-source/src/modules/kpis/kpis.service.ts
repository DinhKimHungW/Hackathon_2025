import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ShipVisit, ShipVisitStatus } from '../ship-visits/entities/ship-visit.entity';
import { Task, TaskStatus, TaskType } from '../tasks/entities/task.entity';
import { Asset, AssetStatus, AssetType } from '../assets/entities/asset.entity';
import { Schedule, ScheduleStatus } from '../schedules/entities/schedule.entity';
import {
  KPISummaryDto,
  ShipKPIsDto,
  TaskKPIsDto,
  AssetKPIsDto,
  ScheduleKPIsDto,
} from './dto/kpi-summary.dto';
import {
  ShipArrivalDataDto,
  TaskStatusDataDto,
  AssetUtilizationDataDto,
  ScheduleTimelineDataDto,
} from './dto/chart-data.dto';

@Injectable()
export class KpisService {
  constructor(
    @InjectRepository(ShipVisit)
    private shipVisitRepository: Repository<ShipVisit>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async getSummary(): Promise<KPISummaryDto> {
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

  private async getShipKPIs(): Promise<ShipKPIsDto> {
    const [total, scheduled, arrived, inProgress, completed, departed] =
      await Promise.all([
        this.shipVisitRepository.count(),
        this.shipVisitRepository.count({ where: { status: ShipVisitStatus.PLANNED } }),
        this.shipVisitRepository.count({ where: { status: ShipVisitStatus.ARRIVED } }),
        this.shipVisitRepository.count({ where: { status: ShipVisitStatus.IN_PROGRESS } }),
        this.shipVisitRepository.count({ where: { status: ShipVisitStatus.COMPLETED } }),
        this.shipVisitRepository.count({ where: { status: ShipVisitStatus.DEPARTED } }),
      ]);

    // Calculate average berth time
    const ships = await this.shipVisitRepository.find({
      where: { status: ShipVisitStatus.COMPLETED },
    });
    let averageBerthTime = 0;
    if (ships.length > 0) {
      const totalBerthTime = ships.reduce((sum, ship) => {
        if (ship.ata && ship.atd) {
          const arrivalTime = new Date(ship.ata).getTime();
          const departureTime = new Date(ship.atd).getTime();
          return sum + (departureTime - arrivalTime) / (1000 * 60 * 60); // hours
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
      delayed: 0, // Can be calculated based on ETA vs ATA
      averageBerthTime: Math.round(averageBerthTime * 10) / 10,
    };
  }

  private async getTaskKPIs(): Promise<TaskKPIsDto> {
    const [total, inProgress, completed, failed] = await Promise.all([
      this.taskRepository.count(),
      this.taskRepository.count({ where: { status: TaskStatus.IN_PROGRESS } }),
      this.taskRepository.count({ where: { status: TaskStatus.COMPLETED } }),
      this.taskRepository.count({ where: { status: TaskStatus.FAILED } }),
    ]);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Count by type
    const [loading, unloading, maintenance, inspection] = await Promise.all([
      this.taskRepository.count({ where: { taskType: TaskType.LOADING } }),
      this.taskRepository.count({ where: { taskType: TaskType.UNLOADING } }),
      this.taskRepository.count({ where: { taskType: TaskType.MAINTENANCE } }),
      this.taskRepository.count({ where: { taskType: TaskType.INSPECTION } }),
    ]);

    // Count by status
    const [pending, assigned, inProgressStatus, completedStatus, cancelled] =
      await Promise.all([
        this.taskRepository.count({ where: { status: TaskStatus.PENDING } }),
        this.taskRepository.count({ where: { status: TaskStatus.ASSIGNED } }),
        this.taskRepository.count({ where: { status: TaskStatus.IN_PROGRESS } }),
        this.taskRepository.count({ where: { status: TaskStatus.COMPLETED } }),
        this.taskRepository.count({ where: { status: TaskStatus.CANCELLED } }),
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

  private async getAssetKPIs(): Promise<AssetKPIsDto> {
    const [total, available, inUse, maintenance] = await Promise.all([
      this.assetRepository.count(),
      this.assetRepository.count({ where: { status: AssetStatus.AVAILABLE } }),
      this.assetRepository.count({ where: { status: AssetStatus.IN_USE } }),
      this.assetRepository.count({ where: { status: AssetStatus.MAINTENANCE } }),
    ]);

    const utilizationRate = total > 0 ? (inUse / total) * 100 : 0;

    // Count by type
    const [crane, forklift, truck, other] = await Promise.all([
      this.assetRepository.count({ where: { type: AssetType.CRANE } }),
      this.assetRepository.count({ where: { type: AssetType.FORKLIFT } }),
      this.assetRepository.count({ where: { type: AssetType.TRUCK } }),
      this.assetRepository.count({ where: { type: AssetType.OTHER } }),
    ]);

    // Count by status
    const [availableStatus, inUseStatus, maintenanceStatus, offline] =
      await Promise.all([
        this.assetRepository.count({ where: { status: AssetStatus.AVAILABLE } }),
        this.assetRepository.count({ where: { status: AssetStatus.IN_USE } }),
        this.assetRepository.count({ where: { status: AssetStatus.MAINTENANCE } }),
        this.assetRepository.count({ where: { status: AssetStatus.OFFLINE } }),
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

  private async getScheduleKPIs(): Promise<ScheduleKPIsDto> {
    const [total, inProgress, pending, completed] = await Promise.all([
      this.scheduleRepository.count(),
      this.scheduleRepository.count({ where: { status: ScheduleStatus.IN_PROGRESS } }),
      this.scheduleRepository.count({ where: { status: ScheduleStatus.PENDING } }),
      this.scheduleRepository.count({ where: { status: ScheduleStatus.COMPLETED } }),
    ]);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // For conflicts, we'll return 0 since the entity doesn't have conflictDetected field
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

  async getShipArrivals(days: number = 7): Promise<ShipArrivalDataDto[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const ships = await this.shipVisitRepository.find({
      where: {
        eta: Between(startDate, endDate),
      },
      order: { eta: 'ASC' },
    });

    // Group by date
    const dataMap = new Map<string, ShipArrivalDataDto>();

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

  async getTaskStatus(): Promise<TaskStatusDataDto[]> {
    const [pending, inProgress, completed, cancelled] = await Promise.all([
      this.taskRepository.count({ where: { status: TaskStatus.PENDING } }),
      this.taskRepository.count({ where: { status: TaskStatus.IN_PROGRESS } }),
      this.taskRepository.count({ where: { status: TaskStatus.COMPLETED } }),
      this.taskRepository.count({ where: { status: TaskStatus.CANCELLED } }),
    ]);

    const total = pending + inProgress + completed + cancelled;

    const colors: Record<string, string> = {
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

  async getAssetUtilization(): Promise<AssetUtilizationDataDto[]> {
    const types = [AssetType.CRANE, AssetType.FORKLIFT, AssetType.TRUCK, AssetType.OTHER];
    const result: AssetUtilizationDataDto[] = [];

    for (const type of types) {
      const [total, available, inUse] = await Promise.all([
        this.assetRepository.count({ where: { type } }),
        this.assetRepository.count({ where: { type, status: AssetStatus.AVAILABLE } }),
        this.assetRepository.count({ where: { type, status: AssetStatus.IN_USE } }),
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

  async getScheduleTimeline(days: number = 7): Promise<ScheduleTimelineDataDto[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const schedules = await this.scheduleRepository.find({
      where: {
        startTime: Between(startDate, endDate),
      },
      order: { startTime: 'ASC' },
    });

    // Group by date
    const dataMap = new Map<string, ScheduleTimelineDataDto>();

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
        if (schedule.status === ScheduleStatus.PENDING || schedule.status === ScheduleStatus.SCHEDULED) {
          data.scheduled++;
        }
        if (schedule.status === ScheduleStatus.IN_PROGRESS) data.active++;
        if (schedule.status === ScheduleStatus.COMPLETED) data.completed++;
      }
    });

    return Array.from(dataMap.values());
  }

  async refresh(): Promise<{ message: string; timestamp: Date }> {
    // This method can trigger background recalculation of KPIs
    // For now, it just returns a confirmation
    return {
      message: 'KPI refresh triggered successfully',
      timestamp: new Date(),
    };
  }
}
