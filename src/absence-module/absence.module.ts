import { Module } from '@nestjs/common';
import { Absence } from './Entities/absence.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenceService } from './absence.service';
import { AbsenceController } from './absence.controller';

@Module({ imports: [TypeOrmModule.forFeature([Absence])],
    providers: [AbsenceService],
    controllers: [AbsenceController],
    exports: [],
  })
export class AbsenceModule {}
