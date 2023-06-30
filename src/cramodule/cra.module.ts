import { Module } from '@nestjs/common';
import { CRA } from './Entities/cra.entity';
import { CRAService } from './cra.service';
import { CRAController } from './cra.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user-module/Entities/user.entity';
import { UserService } from '../user-module/user.service';


@Module({ imports: [TypeOrmModule.forFeature([CRA,User])],
    providers: [CRAService,UserService],
    controllers: [CRAController],
    exports: [CRAService],
  })
export class CraModule {}
