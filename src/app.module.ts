import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user-module/user.module';
import { ProjectModule } from './project-module/project.module';
import { ActivityModule } from './activity-module/activity.module';
import { AbsenceModule } from './absence-module/absence.module';
import { CraModule } from './cramodule/cra.module';
import { HolidayModule } from './holiday-module/holiday.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './notification-module/notification.module';
import { AuthModule } from './auth-module/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'test',
    entities: [
      __dirname + '/**/*.entity{.ts,.js}',
  ],
    synchronize: true,
  }),UserModule, ProjectModule, ActivityModule, AbsenceModule, CraModule, HolidayModule,NotificationModule, AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
