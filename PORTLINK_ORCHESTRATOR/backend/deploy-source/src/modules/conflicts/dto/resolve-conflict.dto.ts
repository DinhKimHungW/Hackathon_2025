import { IsOptional, IsString } from 'class-validator';

export class ResolveConflictDto {
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
