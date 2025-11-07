import { IsOptional, IsEnum, IsUUID, IsDateString, IsString } from 'class-validator';
import { EventType, EventSeverity } from '../entities/event-log.entity';

export class CreateEventLogDto {
  @IsEnum(EventType)
  eventType: EventType;

  @IsOptional()
  @IsEnum(EventSeverity)
  severity?: EventSeverity;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsString()
  description: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class EventLogFilterDto {
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @IsOptional()
  @IsEnum(EventSeverity)
  severity?: EventSeverity;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
