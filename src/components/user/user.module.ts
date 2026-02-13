// src/components/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Booking } from '../bookings/bookings.entity';
import { AdminSeedService } from './admin-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Booking])],
  providers: [UserService, AdminSeedService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
