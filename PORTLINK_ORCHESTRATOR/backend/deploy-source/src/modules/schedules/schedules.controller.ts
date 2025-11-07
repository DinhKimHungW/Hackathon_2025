import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  ScheduleFilterDto,
  ScheduleStatus,
} from './dto/schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findAll(
    @Query() filterDto: ScheduleFilterDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.schedulesService.findAllForUser(user, filterDto);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStatistics() {
    return this.schedulesService.getStatistics();
  }

  @Get('upcoming')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findUpcoming(@Query('hours') hours?: number) {
    return this.schedulesService.findUpcoming(hours);
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findActive() {
    return this.schedulesService.findActive();
  }

  @Get('by-status/:status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findByStatus(@Param('status') status: ScheduleStatus) {
    return this.schedulesService.findByStatus(status);
  }

  @Get('by-ship-visit/:shipVisitId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findByShipVisit(@Param('shipVisitId', ParseUUIDPipe) shipVisitId: string) {
    return this.schedulesService.findByShipVisit(shipVisitId);
  }

  @Post('check-conflicts')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  checkConflicts(
    @Body('startTime') startTime: Date,
    @Body('endTime') endTime: Date,
    @Body('excludeId') excludeId?: string,
  ) {
    return this.schedulesService.findConflicts(startTime, endTime, excludeId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ScheduleStatus,
  ) {
    return this.schedulesService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.remove(id);
  }
}
