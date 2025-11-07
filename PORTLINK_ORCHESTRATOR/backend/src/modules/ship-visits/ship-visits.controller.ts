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
import { ShipVisitsService } from './ship-visits.service';
import {
  CreateShipVisitDto,
  UpdateShipVisitDto,
  ShipVisitFilterDto,
  ShipVisitStatus,
} from './dto/ship-visit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('ship-visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShipVisitsController {
  constructor(private readonly shipVisitsService: ShipVisitsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createShipVisitDto: CreateShipVisitDto) {
    return this.shipVisitsService.create(createShipVisitDto);
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.OPERATIONS,
    UserRole.DRIVER,
  )
  findAll(@Query() filterDto: ShipVisitFilterDto) {
    return this.shipVisitsService.findAll(filterDto);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStatistics() {
    return this.shipVisitsService.getStatistics();
  }

  @Get('upcoming')
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.OPERATIONS,
    UserRole.DRIVER,
  )
  findUpcoming(@Query('days') days?: number) {
    return this.shipVisitsService.findUpcoming(days);
  }

  @Get('active')
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.OPERATIONS,
    UserRole.DRIVER,
  )
  findActive() {
    return this.shipVisitsService.findActive();
  }

  @Get('by-status/:status')
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.OPERATIONS,
    UserRole.DRIVER,
  )
  findByStatus(@Param('status') status: ShipVisitStatus) {
    return this.shipVisitsService.findByStatus(status);
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.OPERATIONS,
    UserRole.DRIVER,
  )
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipVisitsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShipVisitDto: UpdateShipVisitDto,
  ) {
    return this.shipVisitsService.update(id, updateShipVisitDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ShipVisitStatus,
  ) {
    return this.shipVisitsService.updateStatus(id, status);
  }

  @Patch(':id/arrival')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  recordArrival(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('ata') ata: Date,
  ) {
    return this.shipVisitsService.recordArrival(id, ata);
  }

  @Patch(':id/departure')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  recordDeparture(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('atd') atd: Date,
  ) {
    return this.shipVisitsService.recordDeparture(id, atd);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipVisitsService.remove(id);
  }
}
