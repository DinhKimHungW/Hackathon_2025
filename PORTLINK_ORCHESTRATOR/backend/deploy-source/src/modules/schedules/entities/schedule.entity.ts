import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ShipVisit } from '../../ship-visits/entities/ship-visit.entity';
import { Task } from '../../tasks/entities/task.entity';

export enum ScheduleStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity({ schema: 'operations', name: 'schedules' })
@Index(['shipVisitId', 'status'])
@Index(['startTime', 'endTime'])
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  shipVisitId: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.PENDING,
  })
  status: ScheduleStatus;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  operation: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  completionPercentage: number;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @Column({ type: 'int', nullable: true })
  estimatedDuration: number;

  @Column({ type: 'int', nullable: true })
  actualDuration: number;

  @Column({ type: 'jsonb', nullable: true })
  resources: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ShipVisit, (shipVisit) => shipVisit.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shipVisitId' })
  shipVisit: ShipVisit;

  @OneToMany(() => Task, (task) => task.schedule)
  tasks: Task[];
}
