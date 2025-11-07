import { ConflictSeverity, ConflictType } from '../entities/conflict.entity';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateConflictDto {
  @IsString()
  @IsNotEmpty()
  simulationRunId: string;

  @IsEnum(ConflictType)
  conflictType: ConflictType;

  @IsEnum(ConflictSeverity)
  severity: ConflictSeverity;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsObject()
  affectedResources: Record<string, any>;

  @IsDateString()
  conflictTime: string;

  @IsOptional()
  @IsObject()
  suggestedResolution?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  resolved?: boolean;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
