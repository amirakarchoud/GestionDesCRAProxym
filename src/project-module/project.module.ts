import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { Project } from './Entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { UserService } from 'src/user-module/user.service';
import { User } from 'src/user-module/Entities/user.entity';

@Module({imports: [TypeOrmModule.forFeature([Project,User])],
    providers: [ProjectService,UserService],
    controllers: [ProjectController],
    exports: [],})
export class ProjectModule {}
