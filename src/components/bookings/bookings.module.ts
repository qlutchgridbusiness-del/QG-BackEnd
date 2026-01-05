import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './bookings.entity';
import { BookingService } from './bookings.service';
import { BookingController } from './bookings.controller';
import { BusinessServiceEntity } from '../social/business-service.entity';
import { PaymentsService } from '../payments/payments.service';
import { ServicesService } from '../services/services.service';
import { Services } from '../services/services.entity';
import { Business } from '../business/business.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BusinessServiceEntity,
      Services,
      Business,
    ]),
  ],
  providers: [BookingService, PaymentsService, ServicesService],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingsModule {}
