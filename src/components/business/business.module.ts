// src/components/business/business.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './business.entity';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { User } from '../user/user.entity';
import { SocialPost } from '../social/social-post.entity';
import { Services } from '../services/services.entity';
import { BusinessBookingsController } from '../bookings/business-bookings.controller';
import { BookingService } from '../bookings/bookings.service';
import { Booking } from '../bookings/bookings.entity';
import { WhatsappService } from '../notifications/whatsapp.service';
import { PushModule } from '../push/push.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, User, Services, SocialPost, Booking]),
    PushModule,
  ],
  providers: [BusinessService, BookingService, WhatsappService],
  controllers: [BusinessController, BusinessBookingsController],
  exports: [TypeOrmModule],
})
export class BusinessModule {}
