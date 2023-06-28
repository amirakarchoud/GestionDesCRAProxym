import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from './Entities/holiday.entity';
import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Holiday])],
  providers: [HolidayService],
  controllers: [HolidayController],
  exports:[HolidayService],
})
export class HolidayModule {}
