import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ShipVisit } from './entities/ship-visit.entity';
import {
  CreateShipVisitDto,
  UpdateShipVisitDto,
  ShipVisitFilterDto,
  ShipVisitStatus,
} from './dto/ship-visit.dto';

@Injectable()
export class ShipVisitsService {
  constructor(
    @InjectRepository(ShipVisit)
    private readonly shipVisitRepository: Repository<ShipVisit>,
  ) {}

  async create(createShipVisitDto: CreateShipVisitDto): Promise<ShipVisit> {
    const shipVisit = this.shipVisitRepository.create({
      ...createShipVisitDto,
      status: ShipVisitStatus.PLANNED,
    });
    return await this.shipVisitRepository.save(shipVisit);
  }

  async findAll(filterDto?: ShipVisitFilterDto): Promise<ShipVisit[]> {
    const query = this.shipVisitRepository.createQueryBuilder('shipVisit');

    if (filterDto?.status) {
      query.andWhere('shipVisit.status = :status', { status: filterDto.status });
    }

    if (filterDto?.vesselName) {
      query.andWhere('shipVisit.vesselName ILIKE :vesselName', {
        vesselName: `%${filterDto.vesselName}%`,
      });
    }

    if (filterDto?.vesselIMO) {
      query.andWhere('shipVisit.vesselIMO = :vesselIMO', {
        vesselIMO: filterDto.vesselIMO,
      });
    }

    if (filterDto?.berthAllocation) {
      query.andWhere('shipVisit.berthAllocation = :berth', {
        berth: filterDto.berthAllocation,
      });
    }

    if (filterDto?.fromDate && filterDto?.toDate) {
      query.andWhere('shipVisit.eta BETWEEN :fromDate AND :toDate', {
        fromDate: filterDto.fromDate,
        toDate: filterDto.toDate,
      });
    } else if (filterDto?.fromDate) {
      query.andWhere('shipVisit.eta >= :fromDate', {
        fromDate: filterDto.fromDate,
      });
    } else if (filterDto?.toDate) {
      query.andWhere('shipVisit.eta <= :toDate', {
        toDate: filterDto.toDate,
      });
    }

    query.orderBy('shipVisit.eta', 'ASC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<ShipVisit> {
    const shipVisit = await this.shipVisitRepository.findOne({
      where: { id },
    });

    if (!shipVisit) {
      throw new NotFoundException(`Ship visit with ID ${id} not found`);
    }

    return shipVisit;
  }

  async findByStatus(status: ShipVisitStatus): Promise<ShipVisit[]> {
    return await this.shipVisitRepository.find({
      where: { status },
      order: { eta: 'ASC' },
    });
  }

  async findUpcoming(days: number = 7): Promise<ShipVisit[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return await this.shipVisitRepository.find({
      where: {
        eta: Between(now, future),
        status: ShipVisitStatus.PLANNED,
      },
      order: { eta: 'ASC' },
    });
  }

  async findActive(): Promise<ShipVisit[]> {
    return await this.shipVisitRepository.find({
      where: [
        { status: ShipVisitStatus.ARRIVED },
        { status: ShipVisitStatus.IN_PROGRESS },
      ],
      order: { ata: 'ASC' },
    });
  }

  async update(id: string, updateShipVisitDto: UpdateShipVisitDto): Promise<ShipVisit> {
    const shipVisit = await this.findOne(id);

    Object.assign(shipVisit, updateShipVisitDto);

    return await this.shipVisitRepository.save(shipVisit);
  }

  async updateStatus(id: string, status: ShipVisitStatus): Promise<ShipVisit> {
    const shipVisit = await this.findOne(id);

    shipVisit.status = status;

    // Auto-update timestamps based on status
    const now = new Date();
    switch (status) {
      case ShipVisitStatus.ARRIVED:
        if (!shipVisit.ata) {
          shipVisit.ata = now;
        }
        break;
      case ShipVisitStatus.DEPARTED:
        if (!shipVisit.atd) {
          shipVisit.atd = now;
        }
        break;
    }

    return await this.shipVisitRepository.save(shipVisit);
  }

  async recordArrival(id: string, ata: Date): Promise<ShipVisit> {
    const shipVisit = await this.findOne(id);

    shipVisit.ata = ata;
    shipVisit.status = ShipVisitStatus.ARRIVED;

    return await this.shipVisitRepository.save(shipVisit);
  }

  async recordDeparture(id: string, atd: Date): Promise<ShipVisit> {
    const shipVisit = await this.findOne(id);

    shipVisit.atd = atd;
    shipVisit.status = ShipVisitStatus.DEPARTED;

    return await this.shipVisitRepository.save(shipVisit);
  }

  async remove(id: string): Promise<void> {
    const shipVisit = await this.findOne(id);
    await this.shipVisitRepository.remove(shipVisit);
  }

  async getStatistics(): Promise<any> {
    const total = await this.shipVisitRepository.count();

    const byStatus = await this.shipVisitRepository
      .createQueryBuilder('shipVisit')
      .select('shipVisit.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('shipVisit.status')
      .getRawMany();

    const active = await this.shipVisitRepository.count({
      where: [
        { status: ShipVisitStatus.ARRIVED },
        { status: ShipVisitStatus.IN_PROGRESS },
      ],
    });

    const upcoming = await this.findUpcoming(7);

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
}
