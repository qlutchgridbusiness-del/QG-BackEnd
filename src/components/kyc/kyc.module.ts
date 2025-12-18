import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../business/business.entity';
import { BusinessKyc } from './business-kyc.entity';
import { BusinessKycService } from './business-kyc.service';
import { BusinessKycController } from './business-kyc.controller';
import { KycService } from './kyc.service';

@Module({
  imports: [TypeOrmModule.forFeature([Business, BusinessKyc])],
  providers: [BusinessKycService, KycService],
  controllers: [BusinessKycController],
})
export class KycModule {}
