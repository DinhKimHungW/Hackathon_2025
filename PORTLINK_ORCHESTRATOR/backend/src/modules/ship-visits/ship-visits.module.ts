import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipVisitsService } from './ship-visits.service';
import { ShipVisitsController } from './ship-visits.controller';
import { ShipVisit } from './entities/ship-visit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShipVisit])],
  controllers: [ShipVisitsController],
  providers: [ShipVisitsService],
  exports: [ShipVisitsService],
})
export class ShipVisitsModule {}
