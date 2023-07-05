import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { UserService } from 'src/user-module/user.service';
import { User } from 'src/user-module/Entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([User]), JwtModule.register({
        global: true,
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '600s' },
      }),],
  providers: [AuthService,UserService],
  controllers: [AuthController],
})
export class AuthModule {}
