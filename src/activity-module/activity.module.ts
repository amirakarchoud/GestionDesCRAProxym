import { Module } from '@nestjs/common';
import { Activity } from './Entities/activity.entity';
import { ActivityService } from './activity.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityController } from './activity.controller';
import { User } from '../user-module/Entities/user.entity';
import { CRA } from '../cramodule/Entities/cra.entity';
import { Project } from '../project-module/Entities/project.entity';
import { ProjectService } from '../project-module/project.service';
import { UserService } from '../user-module/user.service';
import { CRAService } from '../cramodule/cra.service';
import { Holiday } from '../holiday-module/Entities/holiday.entity';
import { HolidayService } from '../holiday-module/holiday.service';

@Module({ imports: [TypeOrmModule.forFeature([Activity,CRA,User,Project,Holiday])],
    providers: [ActivityService,ProjectService,UserService,CRAService,HolidayService],
    controllers: [ActivityController],
    exports: [],
  })
export class ActivityModule {}
