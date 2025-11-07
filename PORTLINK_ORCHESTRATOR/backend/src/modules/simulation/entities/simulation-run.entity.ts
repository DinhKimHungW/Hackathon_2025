import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Conflict } from '../../conflicts/entities/conflict.entity';

export enum SimulationStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity({ schema: 'simulation', name: 'simulation_runs' })
@Index(['status', 'createdAt'])
export class SimulationRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  scenarioName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SimulationStatus,
    default: SimulationStatus.PENDING,
  })
  status: SimulationStatus;

  @Column({ type: 'jsonb' })
  inputParameters: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  outputResults: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'int', nullable: true })
  executionTimeMs: number;

  @Column({ type: 'int', default: 0 })
  conflictsDetected: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  utilizationRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Conflict, (conflict) => conflict.simulationRun)
  conflicts: Conflict[];
}
