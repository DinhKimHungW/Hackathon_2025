import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto, UpdateScheduleDto, ScheduleFilterDto, ScheduleStatus } from './dto/schedule.dto';
import { ScheduleResponseDto } from './dto/schedule-response.dto';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
export declare class SchedulesService {
    private readonly scheduleRepository;
    constructor(scheduleRepository: Repository<Schedule>);
    create(createScheduleDto: CreateScheduleDto): Promise<ScheduleResponseDto>;
    findAllForUser(user: AuthenticatedUser, filterDto?: ScheduleFilterDto): Promise<ScheduleResponseDto[]>;
    findOne(id: string): Promise<ScheduleResponseDto>;
    findByShipVisit(shipVisitId: string): Promise<ScheduleResponseDto[]>;
    findByStatus(status: ScheduleStatus): Promise<ScheduleResponseDto[]>;
    findUpcoming(hours?: number): Promise<ScheduleResponseDto[]>;
    findActive(): Promise<ScheduleResponseDto[]>;
    findConflicts(startTime: Date, endTime: Date, excludeId?: string): Promise<Schedule[]>;
    update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<ScheduleResponseDto>;
    updateStatus(id: string, status: ScheduleStatus): Promise<ScheduleResponseDto>;
    remove(id: string): Promise<void>;
    getStatistics(): Promise<any>;
    private buildBaseQuery;
    private mapToResponse;
    private inferScheduleType;
}
