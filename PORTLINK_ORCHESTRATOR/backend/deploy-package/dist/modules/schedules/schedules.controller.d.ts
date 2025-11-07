import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleDto, ScheduleFilterDto, ScheduleStatus } from './dto/schedule.dto';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
export declare class SchedulesController {
    private readonly schedulesService;
    constructor(schedulesService: SchedulesService);
    create(createScheduleDto: CreateScheduleDto): Promise<import("./dto/schedule-response.dto").ScheduleResponseDto>;
    findAll(filterDto: ScheduleFilterDto, user: AuthenticatedUser): Promise<import("./dto/schedule-response.dto").ScheduleResponseDto[]>;
    getStatistics(): Promise<any>;
    findUpcoming(hours?: number): Promise<import("./dto/schedule-response.dto").ScheduleResponseDto[]>;
    findActive(): Promise<import("./dto/schedule-response.dto").ScheduleResponseDto[]>;
    findByStatus(status: ScheduleStatus): Promise<import("./dto/schedule-response.dto").ScheduleResponseDto[]>;
    findByShipVisit(shipVisitId: string): Promise<import("./dto/schedule-response.dto").ScheduleResponseDto[]>;
    checkConflicts(startTime: Date, endTime: Date, excludeId?: string): Promise<import("./entities/schedule.entity").Schedule[]>;
    findOne(id: string): Promise<import("./dto/schedule-response.dto").ScheduleResponseDto>;
    update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<import("./dto/schedule-response.dto").ScheduleResponseDto>;
    updateStatus(id: string, status: ScheduleStatus): Promise<import("./dto/schedule-response.dto").ScheduleResponseDto>;
    remove(id: string): Promise<void>;
}
