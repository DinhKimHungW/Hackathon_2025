import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ShipVisit } from '../ship-visits/entities/ship-visit.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Conflict } from '../conflicts/entities/conflict.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShipVisit, Schedule, Conflict])],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
