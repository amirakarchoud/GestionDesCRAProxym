import { Module } from '@nestjs/common';
import { CRA } from './Entities/cra.entity';
import { CRAService } from './cra.service';
import { CRAController } from './cra.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user-module/user.module';
import { User } from 'src/user-module/Entities/user.entity';


@Module({ imports: [TypeOrmModule.forFeature([CRA])],
    providers: [CRAService],
    controllers: [CRAController],
    exports: [],
  })
export class CraModule {}
