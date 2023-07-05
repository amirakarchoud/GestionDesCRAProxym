import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { Project } from './Entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { UserService } from '../user-module/user.service';
import { User } from '../user-module/Entities/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../auth-module/guards/roles.guard';

@Module({imports: [TypeOrmModule.forFeature([Project,User])],
    providers: [ProjectService,UserService,{
        provide: APP_GUARD,
        useClass: RolesGuard,
      },],
    controllers: [ProjectController],
    exports: [],})
export class ProjectModule {}
