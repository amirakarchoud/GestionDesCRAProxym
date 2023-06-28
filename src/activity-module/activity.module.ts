import { Module } from '@nestjs/common';
import { Activity } from './Entities/activity.entity';
import { UserModule } from 'src/user-module/user.module';
import { ActivityService } from './activity.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityController } from './activity.controller';
import { User } from 'src/user-module/Entities/user.entity';

@Module({ imports: [TypeOrmModule.forFeature([Activity]),UserModule,User],
    providers: [ActivityService],
    controllers: [ActivityController],
    exports: [],
  })
export class ActivityModule {}
