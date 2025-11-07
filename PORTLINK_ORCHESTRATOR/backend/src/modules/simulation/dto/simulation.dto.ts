import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
// import { ApiProperty } from '@nestjs/swagger'; // TODO: Install @nestjs/swagger

// Temporary ApiProperty decorator (will be replaced with real Swagger later)
const ApiProperty = (options?: any) => (target: any, propertyKey: string) => {};

export enum ScenarioType {
  SHIP_DELAY = 'SHIP_DELAY',
  ASSET_MAINTENANCE = 'ASSET_MAINTENANCE',
  CUSTOM = 'CUSTOM',
}

export enum SimulationStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class ScenarioChangeDto {
  @ApiProperty({ enum: ['ship_visit', 'asset', 'task'] })
  @IsString()
  @IsNotEmpty()
  entityType: 'ship_visit' | 'asset' | 'task';

  @ApiProperty({ description: 'Identifier of the entity to change' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ description: 'Field to modify (e.g., etaActual, status)' })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty({ description: 'Current value' })
  @IsOptional()
  oldValue: any;

  @ApiProperty({ description: 'New value to apply' })
  @IsNotEmpty()
  newValue: any;
}

export class CreateSimulationDto {
  @ApiProperty({ description: 'Name of the simulation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of what-if scenario', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Base schedule ID to clone from' })
  @IsUUID()
  baseScheduleId: string;

  @ApiProperty({ enum: ScenarioType, description: 'Type of scenario to run' })
  @IsEnum(ScenarioType)
  scenarioType: ScenarioType;

  @ApiProperty({
    type: [ScenarioChangeDto],
    description: 'List of changes to apply in scenario',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScenarioChangeDto)
  changes: ScenarioChangeDto[];
}

export class ConflictDetailDto {
  @ApiProperty({ description: 'Type of conflict detected' })
  type: string;

  @ApiProperty({ enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] })
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty({ description: 'Description of the conflict' })
  description: string;

  @ApiProperty({ description: 'IDs of affected tasks' })
  affectedTaskIds: string[];

  @ApiProperty({ description: 'Affected resources (berth, crane, etc.)' })
  affectedResources: {
    assetId?: string;
    assetName?: string;
    assetType?: string;
  }[];

  @ApiProperty({ description: 'Time range of conflict' })
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export class RecommendationDto {
  @ApiProperty({ description: 'Type of recommendation' })
  type: string;

  @ApiProperty({ description: 'Detailed recommendation description' })
  description: string;

  @ApiProperty({ description: 'Estimated impact of applying this recommendation' })
  estimatedImpact: string;

  @ApiProperty({ description: 'Alternative asset ID (if applicable)' })
  alternativeAssetId?: string;

  @ApiProperty({ description: 'Suggested time adjustment in hours' })
  timeAdjustmentHours?: number;

  @ApiProperty({ description: 'Affected task IDs if recommendation applied' })
  affectedTaskIds?: string[];
}

export class SimulationResultDto {
  @ApiProperty({ description: 'Simulation ID' })
  id: string;

  @ApiProperty({ description: 'Simulation name' })
  name: string;

  @ApiProperty({ description: 'Simulation status' })
  status: SimulationStatus;

  @ApiProperty({ description: 'Base schedule ID' })
  baseScheduleId: string;

  @ApiProperty({ description: 'Result schedule ID (cloned with changes)' })
  resultScheduleId: string;

  @ApiProperty({ description: 'Scenario type' })
  scenarioType: ScenarioType;

  @ApiProperty({ description: 'Execution time in milliseconds' })
  executionTimeMs: number;

  @ApiProperty({ description: 'Number of conflicts detected' })
  conflictsDetected: number;

  @ApiProperty({ type: [ConflictDetailDto], description: 'List of detected conflicts' })
  conflicts: ConflictDetailDto[];

  @ApiProperty({ type: [RecommendationDto], description: 'Recommended solutions' })
  recommendations: RecommendationDto[];

  @ApiProperty({ description: 'Summary metrics' })
  metrics: {
    totalTasks: number;
    affectedTasks: number;
    totalDelayHours: number;
    resourceUtilizationBefore: number;
    resourceUtilizationAfter: number;
  };

  @ApiProperty({ description: 'Timestamp when simulation started' })
  startedAt: Date;

  @ApiProperty({ description: 'Timestamp when simulation completed' })
  completedAt: Date;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;
}

export class ShipDelayScenarioDto {
  @ApiProperty({ description: 'Ship visit ID to delay' })
  @IsUUID()
  shipVisitId: string;

  @ApiProperty({ description: 'Delay duration in hours' })
  @IsNumber()
  delayHours: number;
}

export class AssetMaintenanceScenarioDto {
  @ApiProperty({ description: 'Asset ID (berth or crane) for maintenance' })
  @IsUUID()
  assetId: string;

  @ApiProperty({ description: 'Maintenance start time' })
  @IsDateString()
  maintenanceStartTime: string;

  @ApiProperty({ description: 'Maintenance duration in hours' })
  @IsNumber()
  maintenanceDurationHours: number;
}
