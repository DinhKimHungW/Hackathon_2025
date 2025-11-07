import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SimulationService } from './simulation.service';
import { SimulationController } from './simulation.controller';
import { ConflictDetectionService } from './conflict-detection.service';
import { RecommendationService } from './recommendation.service';
import { WebSocketModule } from '../websocket/websocket.module';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Task } from '../tasks/entities/task.entity';
import { Asset } from '../assets/entities/asset.entity';
import { ShipVisit } from '../ship-visits/entities/ship-visit.entity';
import { redisConfig } from '../../config/redis.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, Task, Asset, ShipVisit]),
    WebSocketModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: redisConfig,
    }),
  ],
  controllers: [SimulationController],
  providers: [SimulationService, ConflictDetectionService, RecommendationService],
  exports: [SimulationService],
})
export class SimulationModule {}
