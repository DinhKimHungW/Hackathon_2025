import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto, TaskStatus } from './dto/task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto): Promise<import("./entities/task.entity").Task>;
    findAll(filterDto: TaskFilterDto): Promise<import("./entities/task.entity").Task[]>;
    getStatistics(): Promise<any>;
    findActive(): Promise<import("./entities/task.entity").Task[]>;
    findPending(): Promise<import("./entities/task.entity").Task[]>;
    findByStatus(status: TaskStatus): Promise<import("./entities/task.entity").Task[]>;
    findByAsset(assetId: string): Promise<import("./entities/task.entity").Task[]>;
    findBySchedule(scheduleId: string): Promise<import("./entities/task.entity").Task[]>;
    findByAssignedTo(assignedTo: string): Promise<import("./entities/task.entity").Task[]>;
    findOne(id: string): Promise<import("./entities/task.entity").Task>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<import("./entities/task.entity").Task>;
    updateStatus(id: string, status: TaskStatus): Promise<import("./entities/task.entity").Task>;
    updateProgress(id: string, percentage: number): Promise<import("./entities/task.entity").Task>;
    assignAsset(id: string, assetId: string): Promise<import("./entities/task.entity").Task>;
    assignTo(id: string, assignedTo: string): Promise<import("./entities/task.entity").Task>;
    remove(id: string): Promise<void>;
}
