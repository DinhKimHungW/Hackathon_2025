import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, SelectQueryBuilder } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  ScheduleFilterDto,
  ScheduleStatus,
} from './dto/schedule.dto';
import { ScheduleResponseDto, TaskResponseDto } from './dto/schedule-response.dto';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UserRole } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<ScheduleResponseDto> {
    // Check for time conflicts
    const conflicts = await this.findConflicts(
      createScheduleDto.startTime,
      createScheduleDto.endTime,
    );

    if (conflicts.length > 0) {
      throw new BadRequestException({
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
      status: ScheduleStatus.PENDING,
    });
    const saved = await this.scheduleRepository.save(schedule);
    return this.findOne(saved.id);
  }

  async findAllForUser(
    user: AuthenticatedUser,
    filterDto?: ScheduleFilterDto,
  ): Promise<ScheduleResponseDto[]> {
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
    } else if (filterDto?.fromDate) {
      query.andWhere('schedule.startTime >= :fromDate', {
        fromDate: filterDto.fromDate,
      });
    } else if (filterDto?.toDate) {
      query.andWhere('schedule.startTime <= :toDate', {
        toDate: filterDto.toDate,
      });
    }

    if (filterDto?.assignedTo) {
      query.andWhere(
        '(task.assignedTo = :assignedTo OR task.metadata ->> :assignedKey = :assignedTo)',
        {
          assignedTo: filterDto.assignedTo,
          assignedKey: 'driverId',
        },
      );
    }

    const normalizedRole = user.role;

    if (normalizedRole === UserRole.DRIVER || filterDto?.onlyMine) {
      query.andWhere(
        `(
          task.assignedTo = :userId
          OR task.assignedTo = :username
          OR task.metadata ->> 'driverId' = :userId
          OR schedule.resources ->> 'assignedDriverId' = :userId
        )`,
        {
          userId: user.id,
          username: user.username,
        },
      );
    }

    query.orderBy('schedule.startTime', 'ASC');

    const schedules = await query.getMany();
    return schedules.map((item) => this.mapToResponse(item));
  }

  async findOne(id: string): Promise<ScheduleResponseDto> {
    const schedule = await this.buildBaseQuery()
      .where('schedule.id = :id', { id })
      .getOne();

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return this.mapToResponse(schedule);
  }

  async findByShipVisit(shipVisitId: string): Promise<ScheduleResponseDto[]> {
    const schedules = await this.buildBaseQuery()
      .where('schedule.shipVisitId = :shipVisitId', { shipVisitId })
      .orderBy('schedule.startTime', 'ASC')
      .getMany();

    return schedules.map((item) => this.mapToResponse(item));
  }

  async findByStatus(status: ScheduleStatus): Promise<ScheduleResponseDto[]> {
    const schedules = await this.buildBaseQuery()
      .where('schedule.status = :status', { status })
      .orderBy('schedule.startTime', 'ASC')
      .getMany();

    return schedules.map((item) => this.mapToResponse(item));
  }

  async findUpcoming(hours: number = 24): Promise<ScheduleResponseDto[]> {
    const now = new Date();
    const future = new Date();
    future.setHours(future.getHours() + hours);

    const schedules = await this.buildBaseQuery()
      .where('schedule.startTime BETWEEN :now AND :future', { now, future })
      .andWhere('schedule.status = :status', {
        status: ScheduleStatus.SCHEDULED,
      })
      .orderBy('schedule.startTime', 'ASC')
      .getMany();

    return schedules.map((item) => this.mapToResponse(item));
  }

  async findActive(): Promise<ScheduleResponseDto[]> {
    const schedules = await this.buildBaseQuery()
      .where('schedule.status = :status', {
        status: ScheduleStatus.IN_PROGRESS,
      })
      .orderBy('schedule.startTime', 'ASC')
      .getMany();

    return schedules.map((item) => this.mapToResponse(item));
  }

  async findConflicts(startTime: Date, endTime: Date, excludeId?: string): Promise<Schedule[]> {
    const query = this.scheduleRepository.createQueryBuilder('schedule')
      .where('schedule.status NOT IN (:...statuses)', {
        statuses: [ScheduleStatus.COMPLETED, ScheduleStatus.CANCELLED],
      })
      .andWhere(
        '(schedule.startTime < :endTime AND schedule.endTime > :startTime)',
        { startTime, endTime },
      );

    if (excludeId) {
      query.andWhere('schedule.id != :excludeId', { excludeId });
    }

    return await query.getMany();
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<ScheduleResponseDto> {
    const schedule = await this.findOne(id);

    // If updating times, check for conflicts
    if (updateScheduleDto.startTime || updateScheduleDto.endTime) {
      const startTime = updateScheduleDto.startTime || schedule.startTime;
      const endTime = updateScheduleDto.endTime || schedule.endTime;

      const conflicts = await this.findConflicts(startTime, endTime, id);

      if (conflicts.length > 0) {
        throw new BadRequestException({
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
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    Object.assign(entity, updateScheduleDto);

    await this.scheduleRepository.save(entity);

    return this.findOne(id);
  }

  async updateStatus(id: string, status: ScheduleStatus): Promise<ScheduleResponseDto> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    schedule.status = status;

    await this.scheduleRepository.save(schedule);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.scheduleRepository.findOne({ where: { id } });

    if (!entity) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    await this.scheduleRepository.remove(entity);
  }

  async getStatistics(): Promise<any> {
    const total = await this.scheduleRepository.count();

    const byStatus = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .select('schedule.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('schedule.status')
      .getRawMany();

    const active = await this.scheduleRepository.count({
      where: { status: ScheduleStatus.IN_PROGRESS },
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

  private buildBaseQuery(): SelectQueryBuilder<Schedule> {
    return this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.shipVisit', 'shipVisit')
      .leftJoinAndSelect('schedule.tasks', 'task')
      .leftJoinAndSelect('task.asset', 'asset');
  }

  private mapToResponse(schedule: Schedule): ScheduleResponseDto {
  const resources = (schedule.resources ?? null) as Record<string, any> | null;
    const shipVisit = schedule.shipVisit
      ? {
          id: schedule.shipVisit.id,
          vesselName: schedule.shipVisit.vesselName,
          vesselIMO: schedule.shipVisit.vesselIMO,
          voyageNumber: schedule.shipVisit.voyageNumber,
          assignedBerth: schedule.shipVisit.berthLocation,
        }
      : null;

    const tasks: TaskResponseDto[] = (schedule.tasks ?? []).map((task: Task) => ({
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

  private inferScheduleType(operation?: string | null): string {
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
}
