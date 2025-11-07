import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from './dto/task.dto';
export declare class TasksService {
    private readonly taskRepository;
    constructor(taskRepository: Repository<Task>);
    create(createTaskDto: CreateTaskDto): Promise<Task>;
    findAll(filterDto?: TaskFilterDto): Promise<Task[]>;
    findOne(id: string): Promise<Task>;
    findByAsset(assetId: string): Promise<Task[]>;
    findBySchedule(scheduleId: string): Promise<Task[]>;
    findByStatus(status: TaskStatus): Promise<Task[]>;
    findByAssignedTo(assignedTo: string): Promise<Task[]>;
    findActive(): Promise<Task[]>;
    findPending(): Promise<Task[]>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task>;
    updateStatus(id: string, status: TaskStatus): Promise<Task>;
    updateProgress(id: string, percentage: number): Promise<Task>;
    assignAsset(id: string, assetId: string): Promise<Task>;
    assignTo(id: string, assignedTo: string): Promise<Task>;
    remove(id: string): Promise<void>;
    getStatistics(): Promise<any>;
}
