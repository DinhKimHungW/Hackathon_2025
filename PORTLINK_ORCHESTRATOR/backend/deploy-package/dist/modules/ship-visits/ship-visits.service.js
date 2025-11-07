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
exports.ShipVisitsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ship_visit_entity_1 = require("./entities/ship-visit.entity");
const ship_visit_dto_1 = require("./dto/ship-visit.dto");
let ShipVisitsService = class ShipVisitsService {
    constructor(shipVisitRepository) {
        this.shipVisitRepository = shipVisitRepository;
    }
    async create(createShipVisitDto) {
        const shipVisit = this.shipVisitRepository.create({
            ...createShipVisitDto,
            status: ship_visit_dto_1.ShipVisitStatus.PLANNED,
        });
        return await this.shipVisitRepository.save(shipVisit);
    }
    async findAll(filterDto) {
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
        }
        else if (filterDto?.fromDate) {
            query.andWhere('shipVisit.eta >= :fromDate', {
                fromDate: filterDto.fromDate,
            });
        }
        else if (filterDto?.toDate) {
            query.andWhere('shipVisit.eta <= :toDate', {
                toDate: filterDto.toDate,
            });
        }
        query.orderBy('shipVisit.eta', 'ASC');
        return await query.getMany();
    }
    async findOne(id) {
        const shipVisit = await this.shipVisitRepository.findOne({
            where: { id },
        });
        if (!shipVisit) {
            throw new common_1.NotFoundException(`Ship visit with ID ${id} not found`);
        }
        return shipVisit;
    }
    async findByStatus(status) {
        return await this.shipVisitRepository.find({
            where: { status },
            order: { eta: 'ASC' },
        });
    }
    async findUpcoming(days = 7) {
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + days);
        return await this.shipVisitRepository.find({
            where: {
                eta: (0, typeorm_2.Between)(now, future),
                status: ship_visit_dto_1.ShipVisitStatus.PLANNED,
            },
            order: { eta: 'ASC' },
        });
    }
    async findActive() {
        return await this.shipVisitRepository.find({
            where: [
                { status: ship_visit_dto_1.ShipVisitStatus.ARRIVED },
                { status: ship_visit_dto_1.ShipVisitStatus.IN_PROGRESS },
            ],
            order: { ata: 'ASC' },
        });
    }
    async update(id, updateShipVisitDto) {
        const shipVisit = await this.findOne(id);
        Object.assign(shipVisit, updateShipVisitDto);
        return await this.shipVisitRepository.save(shipVisit);
    }
    async updateStatus(id, status) {
        const shipVisit = await this.findOne(id);
        shipVisit.status = status;
        const now = new Date();
        switch (status) {
            case ship_visit_dto_1.ShipVisitStatus.ARRIVED:
                if (!shipVisit.ata) {
                    shipVisit.ata = now;
                }
                break;
            case ship_visit_dto_1.ShipVisitStatus.DEPARTED:
                if (!shipVisit.atd) {
                    shipVisit.atd = now;
                }
                break;
        }
        return await this.shipVisitRepository.save(shipVisit);
    }
    async recordArrival(id, ata) {
        const shipVisit = await this.findOne(id);
        shipVisit.ata = ata;
        shipVisit.status = ship_visit_dto_1.ShipVisitStatus.ARRIVED;
        return await this.shipVisitRepository.save(shipVisit);
    }
    async recordDeparture(id, atd) {
        const shipVisit = await this.findOne(id);
        shipVisit.atd = atd;
        shipVisit.status = ship_visit_dto_1.ShipVisitStatus.DEPARTED;
        return await this.shipVisitRepository.save(shipVisit);
    }
    async remove(id) {
        const shipVisit = await this.findOne(id);
        await this.shipVisitRepository.remove(shipVisit);
    }
    async getStatistics() {
        const total = await this.shipVisitRepository.count();
        const byStatus = await this.shipVisitRepository
            .createQueryBuilder('shipVisit')
            .select('shipVisit.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('shipVisit.status')
            .getRawMany();
        const active = await this.shipVisitRepository.count({
            where: [
                { status: ship_visit_dto_1.ShipVisitStatus.ARRIVED },
                { status: ship_visit_dto_1.ShipVisitStatus.IN_PROGRESS },
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
};
exports.ShipVisitsService = ShipVisitsService;
exports.ShipVisitsService = ShipVisitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ship_visit_entity_1.ShipVisit)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ShipVisitsService);
//# sourceMappingURL=ship-visits.service.js.map