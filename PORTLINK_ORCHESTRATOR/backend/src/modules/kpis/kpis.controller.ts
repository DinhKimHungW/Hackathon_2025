import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { KpisService } from './kpis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('kpis')
@UseGuards(JwtAuthGuard)
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Get('summary')
  async getSummary() {
    return this.kpisService.getSummary();
  }

  @Get('charts/ship-arrivals')
  async getShipArrivals(@Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 7;
    return this.kpisService.getShipArrivals(numDays);
  }

  @Get('charts/task-status')
  async getTaskStatus() {
    return this.kpisService.getTaskStatus();
  }

  @Get('charts/asset-utilization')
  async getAssetUtilization() {
    return this.kpisService.getAssetUtilization();
  }

  @Get('charts/schedule-timeline')
  async getScheduleTimeline(@Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 7;
    return this.kpisService.getScheduleTimeline(numDays);
  }

  @Post('refresh')
  async refresh() {
    return this.kpisService.refresh();
  }
}
