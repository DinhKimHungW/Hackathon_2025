import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ConflictsService } from './conflicts.service';
import { CreateConflictDto } from './dto/create-conflict.dto';
import { UpdateConflictDto } from './dto/update-conflict.dto';
import { GetConflictsDto } from './dto/get-conflicts.dto';
import { ResolveConflictDto } from './dto/resolve-conflict.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('conflicts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConflictsController {
  constructor(private readonly conflictsService: ConflictsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  create(@Body() createConflictDto: CreateConflictDto) {
    return this.conflictsService.create(createConflictDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  findAll(@Query() query: GetConflictsDto) {
    return this.conflictsService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  stats(@Query('simulationRunId') simulationRunId?: string) {
    return this.conflictsService.getStats(simulationRunId);
  }

  @Get('unresolved')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  unresolved(
    @Query('limit') limit?: string,
    @Query('simulationRunId') simulationRunId?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const safeLimit = parsedLimit && parsedLimit > 0 ? parsedLimit : 20;
    return this.conflictsService.getUnresolved(safeLimit, simulationRunId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.conflictsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateConflictDto: UpdateConflictDto,
  ) {
    return this.conflictsService.update(id, updateConflictDto);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resolveDto: ResolveConflictDto,
  ) {
    return this.conflictsService.resolve(id, resolveDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.conflictsService.remove(id);
  }
}
