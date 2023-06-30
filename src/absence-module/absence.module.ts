import { Module } from '@nestjs/common';
import { Absence } from './Entities/absence.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenceService } from './absence.service';
import { AbsenceController } from './absence.controller';
import { CRAService } from '../cramodule/cra.service';
import { UserService } from '../user-module/user.service';
import { CRA } from '../cramodule/Entities/cra.entity';
import { User } from '../user-module/Entities/user.entity';
import { HolidayService } from '../holiday-module/holiday.service';
import { Holiday } from '../holiday-module/Entities/holiday.entity';

@Module({ imports: [TypeOrmModule.forFeature([Absence,User,CRA,Holiday])],
    providers: [AbsenceService,CRAService,UserService,HolidayService],
    controllers: [AbsenceController],
    exports: [],
  })
export class AbsenceModule {}
