import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { EventLogsService } from './event-logs.service';
import { EventLogFilterDto } from './dto/event-log.dto';
import { EventType, EventSeverity } from './entities/event-log.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('event-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventLogsController {
  constructor(private readonly eventLogsService: EventLogsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Query() filterDto: EventLogFilterDto) {
    return this.eventLogsService.findAll(filterDto);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStatistics() {
    return this.eventLogsService.getStatistics();
  }

  @Get('recent')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  getRecentLogs(@Query('limit', ParseIntPipe) limit: number = 50) {
    return this.eventLogsService.getRecentLogs(limit);
  }

  @Get('by-event-type/:eventType')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByEventType(@Param('eventType') eventType: EventType) {
    return this.eventLogsService.findByEventType(eventType);
  }

  @Get('by-severity/:severity')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findBySeverity(@Param('severity') severity: EventSeverity) {
    return this.eventLogsService.findBySeverity(severity);
  }

  @Get('by-user/:userId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.eventLogsService.findByUser(userId);
  }

  @Get('by-entity/:entityType/:entityId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.eventLogsService.findByEntity(entityType, entityId);
  }

  @Post('cleanup')
  @Roles(UserRole.ADMIN)
  cleanOldLogs(@Query('days', ParseIntPipe) daysToKeep: number = 90) {
    return this.eventLogsService.cleanOldLogs(daysToKeep);
  }
}
