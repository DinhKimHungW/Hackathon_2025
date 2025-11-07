import { Repository } from 'typeorm';
import { ShipVisit } from './entities/ship-visit.entity';
import { CreateShipVisitDto, UpdateShipVisitDto, ShipVisitFilterDto, ShipVisitStatus } from './dto/ship-visit.dto';
export declare class ShipVisitsService {
    private readonly shipVisitRepository;
    constructor(shipVisitRepository: Repository<ShipVisit>);
    create(createShipVisitDto: CreateShipVisitDto): Promise<ShipVisit>;
    findAll(filterDto?: ShipVisitFilterDto): Promise<ShipVisit[]>;
    findOne(id: string): Promise<ShipVisit>;
    findByStatus(status: ShipVisitStatus): Promise<ShipVisit[]>;
    findUpcoming(days?: number): Promise<ShipVisit[]>;
    findActive(): Promise<ShipVisit[]>;
    update(id: string, updateShipVisitDto: UpdateShipVisitDto): Promise<ShipVisit>;
    updateStatus(id: string, status: ShipVisitStatus): Promise<ShipVisit>;
    recordArrival(id: string, ata: Date): Promise<ShipVisit>;
    recordDeparture(id: string, atd: Date): Promise<ShipVisit>;
    remove(id: string): Promise<void>;
    getStatistics(): Promise<any>;
}
