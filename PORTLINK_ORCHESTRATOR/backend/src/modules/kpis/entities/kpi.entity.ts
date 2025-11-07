import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum KPICategory {
  EFFICIENCY = 'EFFICIENCY',
  UTILIZATION = 'UTILIZATION',
  PERFORMANCE = 'PERFORMANCE',
  COST = 'COST',
  QUALITY = 'QUALITY',
}

@Entity({ schema: 'analytics', name: 'kpis' })
@Index(['category', 'calculatedAt'])
@Index(['entityType', 'entityId'])
export class KPI {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  kpiName: string;

  @Column({
    type: 'enum',
    enum: KPICategory,
  })
  category: KPICategory;

  @Column({ type: 'varchar', length: 100 })
  entityType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  entityId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  @Column({ type: 'timestamp' })
  calculatedAt: Date;

  @Column({ type: 'timestamp' })
  periodStart: Date;

  @Column({ type: 'timestamp' })
  periodEnd: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
