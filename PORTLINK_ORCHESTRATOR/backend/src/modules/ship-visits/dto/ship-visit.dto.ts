import { IsString, IsOptional, IsDate, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum ShipVisitStatus {
  PLANNED = 'PLANNED',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DEPARTED = 'DEPARTED',
  CANCELLED = 'CANCELLED',
}

export class CreateShipVisitDto {
  @IsString()
  vesselName: string;

  @IsString()
  vesselIMO: string;

  @IsOptional()
  @IsString()
  vesselType?: string;

  @IsOptional()
  @IsNumber()
  vesselLength?: number;

  @IsOptional()
  @IsNumber()
  vesselDraft?: number;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsNumber()
  cargoVolume?: number;

  @Type(() => Date)
  @IsDate()
  eta: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  etd?: Date;

  @IsOptional()
  @IsString()
  berthAllocation?: string;

  @IsOptional()
  @IsString()
  agent?: string;
}

export class UpdateShipVisitDto {
  @IsOptional()
  @IsString()
  vesselName?: string;

  @IsOptional()
  @IsString()
  vesselIMO?: string;

  @IsOptional()
  @IsString()
  vesselType?: string;

  @IsOptional()
  @IsNumber()
  vesselLength?: number;

  @IsOptional()
  @IsNumber()
  vesselDraft?: number;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsNumber()
  cargoVolume?: number;

  @IsOptional()
  @IsEnum(ShipVisitStatus)
  status?: ShipVisitStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  eta?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ata?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  etd?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  atd?: Date;

  @IsOptional()
  @IsString()
  berthAllocation?: string;

  @IsOptional()
  @IsString()
  agent?: string;
}

export class ShipVisitFilterDto {
  @IsOptional()
  @IsEnum(ShipVisitStatus)
  status?: ShipVisitStatus;

  @IsOptional()
  @IsString()
  vesselName?: string;

  @IsOptional()
  @IsString()
  vesselIMO?: string;

  @IsOptional()
  @IsString()
  berthAllocation?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fromDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  toDate?: Date;
}
