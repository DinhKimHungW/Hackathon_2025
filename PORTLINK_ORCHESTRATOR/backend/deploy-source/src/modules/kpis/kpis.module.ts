import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpisController } from './kpis.controller';
import { KpisService } from './kpis.service';
import { ShipVisit } from '../ship-visits/entities/ship-visit.entity';
import { Task } from '../tasks/entities/task.entity';
import { Asset } from '../assets/entities/asset.entity';
import { Schedule } from '../schedules/entities/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShipVisit, Task, Asset, Schedule])],
  controllers: [KpisController],
  providers: [KpisService],
  exports: [KpisService],
})
export class KpisModule {}
