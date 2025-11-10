// src/components/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
