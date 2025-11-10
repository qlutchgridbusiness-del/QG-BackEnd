import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './bookings.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BusinessServiceEntity } from '../business-services/business-service.entity';
import { PaymentsService } from '../payments/payments.service';
import { ServicesService } from '../services/services.service';
import { Services } from '../services/services.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BusinessServiceEntity, Services])],
  providers: [BookingsService, PaymentsService, ServicesService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
