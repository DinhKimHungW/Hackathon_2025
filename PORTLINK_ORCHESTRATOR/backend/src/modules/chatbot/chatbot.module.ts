import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { AIService } from './ai.service';
import { ShipVisit } from '../ship-visits/entities/ship-visit.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Conflict } from '../conflicts/entities/conflict.entity';
import { Asset } from '../assets/entities/asset.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShipVisit, Schedule, Conflict, Asset, Task]),
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, AIService],
  exports: [ChatbotService, AIService],
})
export class ChatbotModule {}
