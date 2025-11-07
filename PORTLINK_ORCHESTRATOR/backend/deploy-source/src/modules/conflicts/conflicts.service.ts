import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Conflict, ConflictSeverity, ConflictType } from './entities/conflict.entity';
import { CreateConflictDto } from './dto/create-conflict.dto';
import { UpdateConflictDto } from './dto/update-conflict.dto';
import { GetConflictsDto } from './dto/get-conflicts.dto';
import { ResolveConflictDto } from './dto/resolve-conflict.dto';

@Injectable()
export class ConflictsService {
  constructor(
    @InjectRepository(Conflict)
    private readonly conflictRepository: Repository<Conflict>,
  ) {}

  async create(createDto: CreateConflictDto): Promise<Conflict> {
    const { conflictTime, ...rest } = createDto;

    const conflict = this.conflictRepository.create({
      ...rest,
      conflictTime: new Date(conflictTime),
    });

    return this.conflictRepository.save(conflict);
  }

  async findAll(query: GetConflictsDto): Promise<{
    data: Conflict[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, conflictType, severity, resolved, simulationRunId, search } = query;
    const qb = this.conflictRepository
      .createQueryBuilder('conflict')
      .orderBy('conflict.conflictTime', 'DESC');

    if (conflictType && conflictType !== 'ALL') {
      qb.andWhere('conflict.conflictType = :conflictType', { conflictType });
    }

    if (severity && severity !== 'ALL') {
      qb.andWhere('conflict.severity = :severity', { severity });
    }

    if (resolved === 'RESOLVED') {
      qb.andWhere('conflict.resolved = :resolved', { resolved: true });
    } else if (resolved === 'UNRESOLVED') {
      qb.andWhere('conflict.resolved = :resolved', { resolved: false });
    }

    if (simulationRunId) {
      qb.andWhere('conflict.simulationRunId = :simulationRunId', { simulationRunId });
    }

    if (search) {
      qb.andWhere(
        '(conflict.description ILIKE :search OR conflict.resolutionNotes ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Conflict> {
    const conflict = await this.conflictRepository.findOne({ where: { id } });

    if (!conflict) {
      throw new NotFoundException(`Conflict with id ${id} not found`);
    }

    return conflict;
  }

  async update(id: string, updateDto: UpdateConflictDto): Promise<Conflict> {
    const conflict = await this.findOne(id);

    const { conflictTime, ...rest } = updateDto;

    Object.assign(conflict, rest);

    if (conflictTime) {
      conflict.conflictTime = new Date(conflictTime);
    }

    return this.conflictRepository.save(conflict);
  }

  async resolve(id: string, resolveDto: ResolveConflictDto): Promise<Conflict> {
    const conflict = await this.findOne(id);

    conflict.resolved = true;

    if (resolveDto.resolutionNotes !== undefined) {
      conflict.resolutionNotes = resolveDto.resolutionNotes;
    }

    return this.conflictRepository.save(conflict);
  }

  async remove(id: string): Promise<void> {
    const result = await this.conflictRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Conflict with id ${id} not found`);
    }
  }

  async getStats(simulationRunId?: string) {
    const whereClause: FindOptionsWhere<Conflict> = simulationRunId
      ? { simulationRunId }
      : {};

    const total = await this.conflictRepository.count({ where: whereClause });
    const unresolved = await this.conflictRepository.count({
      where: { ...whereClause, resolved: false },
    });

    const severityQb = this.conflictRepository
      .createQueryBuilder('conflict')
      .select('conflict.severity', 'severity')
      .addSelect('COUNT(conflict.id)', 'count');

    if (simulationRunId) {
      severityQb.where('conflict.simulationRunId = :simulationRunId', { simulationRunId });
    }

    const severityBreakdownRaw = await severityQb
      .groupBy('conflict.severity')
      .getRawMany();

    const typeQb = this.conflictRepository
      .createQueryBuilder('conflict')
      .select('conflict.conflictType', 'type')
      .addSelect('COUNT(conflict.id)', 'count');

    if (simulationRunId) {
      typeQb.where('conflict.simulationRunId = :simulationRunId', { simulationRunId });
    }

    const typeBreakdownRaw = await typeQb
      .groupBy('conflict.conflictType')
      .getRawMany();

    const bySeverity = {} as Record<ConflictSeverity, number>;
    (Object.values(ConflictSeverity) as ConflictSeverity[]).forEach((key) => {
      bySeverity[key] = 0;
    });

    severityBreakdownRaw.forEach((item) => {
      const key = item.severity as ConflictSeverity;
      bySeverity[key] = Number(item.count) || 0;
    });

    const byType = {} as Record<ConflictType, number>;
    (Object.values(ConflictType) as ConflictType[]).forEach((key) => {
      byType[key] = 0;
    });

    typeBreakdownRaw.forEach((item) => {
      const key = item.type as ConflictType;
      byType[key] = Number(item.count) || 0;
    });

    const critical = bySeverity[ConflictSeverity.CRITICAL] || 0;

    return {
      total,
      unresolved,
      critical,
      bySeverity,
      byType,
    };
  }

  async getUnresolved(limit = 20, simulationRunId?: string): Promise<Conflict[]> {
    const parsedLimit = Number.isFinite(limit) ? limit : 20;
    const safeLimit = parsedLimit > 0 ? parsedLimit : 20;

    const where = simulationRunId
      ? { resolved: false, simulationRunId }
      : { resolved: false };

    return this.conflictRepository.find({
      where,
      order: { conflictTime: 'DESC' },
      take: safeLimit,
    });
  }
}
