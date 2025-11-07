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
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto, TaskStatus } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findAll(@Query() filterDto: TaskFilterDto) {
    return this.tasksService.findAll(filterDto);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  getStatistics() {
    return this.tasksService.getStatistics();
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findActive() {
    return this.tasksService.findActive();
  }

  @Get('pending')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  findPending() {
    return this.tasksService.findPending();
  }

  @Get('by-status/:status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findByStatus(@Param('status') status: TaskStatus) {
    return this.tasksService.findByStatus(status);
  }

  @Get('by-asset/:assetId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findByAsset(@Param('assetId', ParseUUIDPipe) assetId: string) {
    return this.tasksService.findByAsset(assetId);
  }

  @Get('by-schedule/:scheduleId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  findBySchedule(@Param('scheduleId', ParseUUIDPipe) scheduleId: string) {
    return this.tasksService.findBySchedule(scheduleId);
  }

  @Get('by-assigned-to/:assignedTo')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findByAssignedTo(@Param('assignedTo') assignedTo: string) {
    return this.tasksService.findByAssignedTo(assignedTo);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TaskStatus,
  ) {
    return this.tasksService.updateStatus(id, status);
  }

  @Patch(':id/progress')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS, UserRole.DRIVER)
  updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('percentage', ParseIntPipe) percentage: number,
  ) {
    return this.tasksService.updateProgress(id, percentage);
  }

  @Patch(':id/assign-asset')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  assignAsset(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('assetId', ParseUUIDPipe) assetId: string,
  ) {
    return this.tasksService.assignAsset(id, assetId);
  }

  @Patch(':id/assign-to')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATIONS)
  assignTo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('assignedTo') assignedTo: string,
  ) {
    return this.tasksService.assignTo(id, assignedTo);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
