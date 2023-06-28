import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [],
    controllers: [],
    providers: [],})
export class UserModule {}
