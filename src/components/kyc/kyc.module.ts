// src/components/kyc/kyc.module.ts
import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { Business } from '../business/business.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Business])],
  providers: [KycService, Business],
  controllers: [KycController],
})
export class KycModule {}
