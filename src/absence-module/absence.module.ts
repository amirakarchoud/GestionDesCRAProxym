import { Module } from '@nestjs/common';
import { Absence } from './Entities/absence.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenceService } from './absence.service';
import { AbsenceController } from './absence.controller';
import { CRAService } from 'src/cramodule/cra.service';
import { UserService } from 'src/user-module/user.service';
import { CRA } from 'src/cramodule/Entities/cra.entity';
import { User } from 'src/user-module/Entities/user.entity';
import { HolidayService } from 'src/holiday-module/holiday.service';
import { Holiday } from 'src/holiday-module/Entities/holiday.entity';

@Module({ imports: [TypeOrmModule.forFeature([Absence,User,CRA,Holiday])],
    providers: [AbsenceService,CRAService,UserService,HolidayService],
    controllers: [AbsenceController],
    exports: [],
  })
export class AbsenceModule {}
