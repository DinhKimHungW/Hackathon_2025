import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Schedule } from '../../schedules/entities/schedule.entity';

export enum ShipVisitStatus {
  PLANNED = 'PLANNED',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DEPARTED = 'DEPARTED',
  CANCELLED = 'CANCELLED',
}

@Entity({ schema: 'operations', name: 'ship_visits' })
@Index(['vesselName', 'eta'])
@Index(['status'])
export class ShipVisit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  vesselName: string;

  @Column({ length: 100, nullable: true })
  vesselIMO: string;

  @Column({ length: 100, nullable: true })
  voyageNumber: string;

  @Column({ type: 'timestamp' })
  eta: Date;

  @Column({ type: 'timestamp', nullable: true })
  etd: Date;

  @Column({ type: 'timestamp', nullable: true })
  ata: Date;

  @Column({ type: 'timestamp', nullable: true })
  atd: Date;

  @Column({
    type: 'enum',
    enum: ShipVisitStatus,
    default: ShipVisitStatus.PLANNED,
  })
  status: ShipVisitStatus;

  @Column({ length: 100, nullable: true })
  berthLocation: string;

  @Column({ type: 'int', nullable: true })
  totalContainers: number;

  @Column({ type: 'int', nullable: true })
  containersLoaded: number;

  @Column({ type: 'int', nullable: true })
  containersUnloaded: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  completionPercentage: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shippingLine: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  agent: string;

  @Column({ type: 'jsonb', nullable: true })
  cargoDetails: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Schedule, (schedule) => schedule.shipVisit)
  schedules: Schedule[];
}
