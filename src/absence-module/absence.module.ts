import { Module } from '@nestjs/common';
import { Absence } from './Entities/absence.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Absenceservice } from './absence.service';
import { AbsenceController } from './absence.controller';
import { UserModule } from 'src/user-module/user.module';
import { User } from 'src/user-module/Entities/user.entity';

@Module({ imports: [TypeOrmModule.forFeature([Absence]),UserModule],
    providers: [Absenceservice],
    controllers: [AbsenceController],
    exports: [],
  })
export class AbsenceModule {}
