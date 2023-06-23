import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user-module/user/user.module';
import { ProjectModule } from './project-module/project/project.module';
import { ActivityModule } from './activity-module/activity/activity.module';
import { AbsenceModule } from './absence-module/absence/absence.module';
import { CraModule } from './cramodule/cra/cra.module';
import { HolidayModule } from './holiday-module/holiday/holiday.module';

@Module({
  imports: [UserModule, ProjectModule, ActivityModule, AbsenceModule, CraModule, HolidayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
