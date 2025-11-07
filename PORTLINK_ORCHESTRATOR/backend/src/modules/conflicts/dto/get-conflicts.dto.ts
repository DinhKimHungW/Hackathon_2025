import { ConflictSeverity, ConflictType } from '../entities/conflict.entity';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetConflictsDto {
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : 1))
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : 25))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;

  @IsOptional()
  @IsIn([...Object.values(ConflictType), 'ALL'])
  conflictType?: ConflictType | 'ALL';

  @IsOptional()
  @IsIn([...Object.values(ConflictSeverity), 'ALL'])
  severity?: ConflictSeverity | 'ALL';

  @IsOptional()
  @IsIn(['ALL', 'RESOLVED', 'UNRESOLVED'])
  resolved?: 'ALL' | 'RESOLVED' | 'UNRESOLVED';

  @IsOptional()
  @IsString()
  simulationRunId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
