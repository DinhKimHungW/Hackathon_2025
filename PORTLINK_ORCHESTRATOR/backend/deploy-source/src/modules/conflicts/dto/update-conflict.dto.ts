import { PartialType } from '@nestjs/mapped-types';
import { CreateConflictDto } from './create-conflict.dto';
import { IsDateString, IsObject, IsOptional } from 'class-validator';

export class UpdateConflictDto extends PartialType(CreateConflictDto) {
  @IsOptional()
  @IsDateString()
  conflictTime?: string;

  @IsOptional()
  @IsObject()
  affectedResources?: Record<string, any>;

  @IsOptional()
  @IsObject()
  suggestedResolution?: Record<string, any>;
}
