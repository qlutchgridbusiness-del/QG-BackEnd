// src/components/payments/payments.module.ts
import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { BookingService } from '../bookings/bookings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../business/business.entity';
import { Booking } from '../bookings/bookings.entity';
import { Services } from '../services/services.entity';
import { WhatsappService } from '../notifications/whatsapp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Business, Booking, Services])],
  providers: [PaymentsService, BookingService, WhatsappService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
