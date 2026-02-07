// src/components/payments/payments.module.ts
import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../business/business.entity';
import { BookingsModule } from '../bookings/bookings.module';
import { PushModule } from '../push/push.module';

@Module({
  imports: [TypeOrmModule.forFeature([Business]), PushModule, BookingsModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
