import { ShipVisitsService } from './ship-visits.service';
import { CreateShipVisitDto, UpdateShipVisitDto, ShipVisitFilterDto, ShipVisitStatus } from './dto/ship-visit.dto';
export declare class ShipVisitsController {
    private readonly shipVisitsService;
    constructor(shipVisitsService: ShipVisitsService);
    create(createShipVisitDto: CreateShipVisitDto): Promise<import("./entities/ship-visit.entity").ShipVisit>;
    findAll(filterDto: ShipVisitFilterDto): Promise<import("./entities/ship-visit.entity").ShipVisit[]>;
    getStatistics(): Promise<any>;
    findUpcoming(days?: number): Promise<import("./entities/ship-visit.entity").ShipVisit[]>;
    findActive(): Promise<import("./entities/ship-visit.entity").ShipVisit[]>;
    findByStatus(status: ShipVisitStatus): Promise<import("./entities/ship-visit.entity").ShipVisit[]>;
    findOne(id: string): Promise<import("./entities/ship-visit.entity").ShipVisit>;
    update(id: string, updateShipVisitDto: UpdateShipVisitDto): Promise<import("./entities/ship-visit.entity").ShipVisit>;
    updateStatus(id: string, status: ShipVisitStatus): Promise<import("./entities/ship-visit.entity").ShipVisit>;
    recordArrival(id: string, ata: Date): Promise<import("./entities/ship-visit.entity").ShipVisit>;
    recordDeparture(id: string, atd: Date): Promise<import("./entities/ship-visit.entity").ShipVisit>;
    remove(id: string): Promise<void>;
}
