import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection()
    private connection: Connection,
  ) {}

  @Get()
  async check() {
    const dbHealthy = this.connection.isInitialized;

    return {
      status: dbHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }

  @Get('ping')
  ping() {
    return { status: 'pong', timestamp: new Date().toISOString() };
  }
}
