// src/components/auth/otp.module.ts
import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpStore } from './otp.store';

@Module({
  providers: [OtpService, OtpStore],
  exports: [OtpService],
})
export class OtpModule {}
