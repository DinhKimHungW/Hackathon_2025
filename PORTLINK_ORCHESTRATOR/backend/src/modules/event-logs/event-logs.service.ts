import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventLog, EventType, EventSeverity } from './entities/event-log.entity';
import { CreateEventLogDto, EventLogFilterDto } from './dto/event-log.dto';

@Injectable()
export class EventLogsService {
  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
  ) {}

  async createLog(createEventLogDto: CreateEventLogDto): Promise<EventLog> {
    const eventLog = this.eventLogRepository.create({
      ...createEventLogDto,
      severity: createEventLogDto.severity || EventSeverity.INFO,
    });
    return await this.eventLogRepository.save(eventLog);
  }

  async logEvent(
    eventType: EventType,
    description: string,
    options?: {
      userId?: string;
      entityType?: string;
      entityId?: string;
      severity?: EventSeverity;
      metadata?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<EventLog> {
    return await this.createLog({
      eventType,
      description,
      severity: options?.severity || EventSeverity.INFO,
      userId: options?.userId,
      entityType: options?.entityType,
      entityId: options?.entityId,
      metadata: options?.metadata,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    });
  }

  async findAll(filterDto?: EventLogFilterDto): Promise<EventLog[]> {
    const query = this.eventLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user');

    if (filterDto?.eventType) {
      query.andWhere('log.eventType = :eventType', { eventType: filterDto.eventType });
    }

    if (filterDto?.severity) {
      query.andWhere('log.severity = :severity', { severity: filterDto.severity });
    }

    if (filterDto?.userId) {
      query.andWhere('log.userId = :userId', { userId: filterDto.userId });
    }

    if (filterDto?.entityType) {
      query.andWhere('log.entityType = :entityType', { entityType: filterDto.entityType });
    }

    if (filterDto?.entityId) {
      query.andWhere('log.entityId = :entityId', { entityId: filterDto.entityId });
    }

    if (filterDto?.startDate && filterDto?.endDate) {
      query.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(filterDto.startDate),
        endDate: new Date(filterDto.endDate),
      });
    } else if (filterDto?.startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate: new Date(filterDto.startDate) });
    } else if (filterDto?.endDate) {
      query.andWhere('log.createdAt <= :endDate', { endDate: new Date(filterDto.endDate) });
    }

    if (filterDto?.search) {
      query.andWhere('log.description ILIKE :search', { search: `%${filterDto.search}%` });
    }

    query.orderBy('log.createdAt', 'DESC');
    query.take(1000); // Limit to 1000 results

    return await query.getMany();
  }

  async findByEventType(eventType: EventType): Promise<EventLog[]> {
    return await this.eventLogRepository.find({
      where: { eventType },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findBySeverity(severity: EventSeverity): Promise<EventLog[]> {
    return await this.eventLogRepository.find({
      where: { severity },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findByUser(userId: string): Promise<EventLog[]> {
    return await this.eventLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findByEntity(entityType: string, entityId: string): Promise<EventLog[]> {
    return await this.eventLogRepository.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRecentLogs(limit: number = 50): Promise<EventLog[]> {
    return await this.eventLogRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getStatistics(): Promise<any> {
    const total = await this.eventLogRepository.count();

    const byType = await this.eventLogRepository
      .createQueryBuilder('log')
      .select('log.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.eventType')
      .getRawMany();

    const bySeverity = await this.eventLogRepository
      .createQueryBuilder('log')
      .select('log.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.severity')
      .getRawMany();

    const last24Hours = await this.eventLogRepository
      .createQueryBuilder('log')
      .where('log.createdAt >= :since', { since: new Date(Date.now() - 24 * 60 * 60 * 1000) })
      .getCount();

    const errors = await this.eventLogRepository.count({
      where: { severity: EventSeverity.ERROR },
    });

    const critical = await this.eventLogRepository.count({
      where: { severity: EventSeverity.CRITICAL },
    });

    return {
      total,
      last24Hours,
      errors,
      critical,
      byType: byType.reduce((acc, item) => {
        acc[item.eventtype] = parseInt(item.count);
        return acc;
      }, {}),
      bySeverity: bySeverity.reduce((acc, item) => {
        acc[item.severity] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  async cleanOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.eventLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
