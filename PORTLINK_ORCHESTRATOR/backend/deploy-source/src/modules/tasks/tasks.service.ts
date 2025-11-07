import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      startTime: new Date(createTaskDto.startTime),
      endTime: new Date(createTaskDto.endTime),
      status: TaskStatus.PENDING,
      priority: createTaskDto.priority || 0,
    });
    return await this.taskRepository.save(task);
  }

  async findAll(filterDto?: TaskFilterDto): Promise<Task[]> {
    const query = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.schedule', 'schedule')
      .leftJoinAndSelect('task.asset', 'asset');

    if (filterDto?.taskType) {
      query.andWhere('task.taskType = :taskType', { taskType: filterDto.taskType });
    }

    if (filterDto?.status) {
      query.andWhere('task.status = :status', { status: filterDto.status });
    }

    if (filterDto?.scheduleId) {
      query.andWhere('task.scheduleId = :scheduleId', { scheduleId: filterDto.scheduleId });
    }

    if (filterDto?.assetId) {
      query.andWhere('task.assetId = :assetId', { assetId: filterDto.assetId });
    }

    if (filterDto?.assignedTo) {
      query.andWhere('task.assignedTo = :assignedTo', { assignedTo: filterDto.assignedTo });
    }

    if (filterDto?.search) {
      query.andWhere('(task.taskName ILIKE :search OR task.notes ILIKE :search)', { 
        search: `%${filterDto.search}%` 
      });
    }

    query.orderBy('task.priority', 'DESC').addOrderBy('task.startTime', 'ASC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['schedule', 'asset'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async findByAsset(assetId: string): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { assetId },
      relations: ['schedule'],
      order: { startTime: 'ASC' },
    });
  }

  async findBySchedule(scheduleId: string): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { scheduleId },
      relations: ['asset'],
      order: { priority: 'DESC', startTime: 'ASC' },
    });
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { status },
      relations: ['schedule', 'asset'],
      order: { priority: 'DESC', startTime: 'ASC' },
    });
  }

  async findByAssignedTo(assignedTo: string): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { assignedTo },
      relations: ['schedule', 'asset'],
      order: { priority: 'DESC', startTime: 'ASC' },
    });
  }

  async findActive(): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { status: TaskStatus.IN_PROGRESS },
      relations: ['schedule', 'asset'],
      order: { priority: 'DESC' },
    });
  }

  async findPending(): Promise<Task[]> {
    return await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.schedule', 'schedule')
      .leftJoinAndSelect('task.asset', 'asset')
      .where('task.status IN (:...statuses)', { statuses: [TaskStatus.PENDING, TaskStatus.ASSIGNED] })
      .orderBy('task.priority', 'DESC')
      .addOrderBy('task.startTime', 'ASC')
      .getMany();
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (updateTaskDto.startTime) {
      task.startTime = new Date(updateTaskDto.startTime);
    }
    if (updateTaskDto.endTime) {
      task.endTime = new Date(updateTaskDto.endTime);
    }
    if (updateTaskDto.actualStartTime) {
      task.actualStartTime = new Date(updateTaskDto.actualStartTime);
    }
    if (updateTaskDto.actualEndTime) {
      task.actualEndTime = new Date(updateTaskDto.actualEndTime);
    }

    Object.assign(task, {
      ...updateTaskDto,
      startTime: task.startTime,
      endTime: task.endTime,
      actualStartTime: task.actualStartTime,
      actualEndTime: task.actualEndTime,
    });

    return await this.taskRepository.save(task);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.findOne(id);

    task.status = status;

    const now = new Date();
    if (status === TaskStatus.IN_PROGRESS && !task.actualStartTime) {
      task.actualStartTime = now;
    } else if ((status === TaskStatus.COMPLETED || status === TaskStatus.FAILED) && !task.actualEndTime) {
      task.actualEndTime = now;
      if (task.actualStartTime) {
        task.actualDuration = Math.floor((now.getTime() - task.actualStartTime.getTime()) / 60000);
      }
      if (status === TaskStatus.COMPLETED) {
        task.completionPercentage = 100;
      }
    }

    return await this.taskRepository.save(task);
  }

  async updateProgress(id: string, percentage: number): Promise<Task> {
    const task = await this.findOne(id);
    task.completionPercentage = Math.min(100, Math.max(0, percentage));
    
    if (task.completionPercentage === 100 && task.status === TaskStatus.IN_PROGRESS) {
      task.status = TaskStatus.COMPLETED;
      task.actualEndTime = new Date();
      if (task.actualStartTime) {
        task.actualDuration = Math.floor((task.actualEndTime.getTime() - task.actualStartTime.getTime()) / 60000);
      }
    }

    return await this.taskRepository.save(task);
  }

  async assignAsset(id: string, assetId: string): Promise<Task> {
    const task = await this.findOne(id);
    task.assetId = assetId;
    if (task.status === TaskStatus.PENDING) {
      task.status = TaskStatus.ASSIGNED;
    }
    return await this.taskRepository.save(task);
  }

  async assignTo(id: string, assignedTo: string): Promise<Task> {
    const task = await this.findOne(id);
    task.assignedTo = assignedTo;
    if (task.status === TaskStatus.PENDING) {
      task.status = TaskStatus.ASSIGNED;
    }
    return await this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }

  async getStatistics(): Promise<any> {
    const total = await this.taskRepository.count();

    const byStatus = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('task.status')
      .getRawMany();

    const byType = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.taskType', 'taskType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('task.taskType')
      .getRawMany();

    const active = await this.taskRepository.count({
      where: { status: TaskStatus.IN_PROGRESS },
    });

    const pending = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.status IN (:...statuses)', { statuses: [TaskStatus.PENDING, TaskStatus.ASSIGNED] })
      .getCount();

    const avgCompletion = await this.taskRepository
      .createQueryBuilder('task')
      .select('AVG(task.completionPercentage)', 'avg')
      .where('task.status = :status', { status: TaskStatus.IN_PROGRESS })
      .getRawOne();

    return {
      total,
      active,
      pending,
      averageCompletion: parseFloat(avgCompletion?.avg || '0').toFixed(2),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      byType: byType.reduce((acc, item) => {
        acc[item.tasktype] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }
}
