import { ScheduleStatus } from './schedule.dto';
import { TaskStatus, TaskType } from '../../tasks/entities/task.entity';

export interface TaskResponseDto {
  id: string;
  taskName: string;
  taskType: TaskType;
  status: TaskStatus;
  startTime: Date;
  endTime: Date;
  assignedTo: string | null;
  location?: string | null;
  assetId?: string | null;
  asset?: {
    id: string;
    name: string;
    type: string;
    status: string;
  } | null;
  metadata?: Record<string, any> | null;
  notes?: string | null;
}

export interface ScheduleResponseDto {
  id: string;
  name: string;
  operation: string | null;
  description: string | null;
  type: string;
  status: ScheduleStatus;
  startTime: Date;
  endTime: Date;
  actualStartTime?: Date | null;
  actualEndTime?: Date | null;
  completionPercentage?: number | null;
  priority?: number | null;
  shipVisitId: string | null;
  shipVisit?: {
    id: string;
    vesselName?: string | null;
    vesselIMO?: string | null;
    voyageNumber?: string | null;
    assignedBerth?: string | null;
  } | null;
  berthId: string | null;
  berthName?: string | null;
  resources?: Record<string, any> | null;
  notes?: string | null;
  tasks: TaskResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
