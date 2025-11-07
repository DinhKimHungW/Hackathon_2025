import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SimulationRun } from '../../simulation/entities/simulation-run.entity';

export enum ConflictType {
  RESOURCE_OVERLAP = 'RESOURCE_OVERLAP',
  TIME_OVERLAP = 'TIME_OVERLAP',
  LOCATION_OVERLAP = 'LOCATION_OVERLAP',
  CAPACITY_EXCEEDED = 'CAPACITY_EXCEEDED',
}

export enum ConflictSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity({ schema: 'simulation', name: 'conflicts' })
@Index(['simulationRunId', 'severity'])
@Index(['conflictType', 'severity'])
export class Conflict {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  simulationRunId: string;

  @Column({
    type: 'enum',
    enum: ConflictType,
  })
  conflictType: ConflictType;

  @Column({
    type: 'enum',
    enum: ConflictSeverity,
  })
  severity: ConflictSeverity;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb' })
  affectedResources: Record<string, any>;

  @Column({ type: 'timestamp' })
  conflictTime: Date;

  @Column({ type: 'jsonb', nullable: true })
  suggestedResolution: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  resolved: boolean;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => SimulationRun, (simulationRun) => simulationRun.conflicts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'simulationRunId' })
  simulationRun: SimulationRun;
}
