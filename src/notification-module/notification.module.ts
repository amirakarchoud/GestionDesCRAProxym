import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { ScheduleModule } from "@nestjs/schedule";
import { UserService } from "../user-module/user.service";
import { CRAService } from "../cramodule/cra.service";

@Module({
    imports: [ScheduleModule.forRoot()],
  providers: [NotificationService,UserService,CRAService],
  controllers: [NotificationController],
  exports:[NotificationService],
})
export class NotificationModule {}