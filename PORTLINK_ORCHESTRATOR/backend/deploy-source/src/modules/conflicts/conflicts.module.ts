import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConflictsController } from './conflicts.controller';
import { ConflictsService } from './conflicts.service';
import { Conflict } from './entities/conflict.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conflict])],
  controllers: [ConflictsController],
  providers: [ConflictsService],
  exports: [ConflictsService],
})
export class ConflictsModule {}
