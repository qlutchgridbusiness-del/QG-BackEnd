import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessKyc } from './business-kyc.entity';
import { Repository } from 'typeorm';
import { Business } from '../business/business.entity';
import { KycService } from './kyc.service';
import { BusinessStatus } from '../business/business-status.enum';

// business-kyc.service.ts
@Injectable()
export class BusinessKycService {
  constructor(
    @InjectRepository(BusinessKyc)
    private kycRepo: Repository<BusinessKyc>,
    @InjectRepository(Business)
    private businessRepo: Repository<Business>,
    private surepass: KycService,
  ) {}

  async submitPan(businessId: string, pan: string) {
    const business = await this.businessRepo.findOneBy({ id: businessId });

    const res = await this.surepass.verifyPan(pan);

    const kyc = await this.kycRepo.save({
      business,
      panNumber: pan,
      panVerified: res.success === true,
      panResponse: res,
      status: res.success ?? 'PENDING',
    });

    business.status = BusinessStatus.KYC_PENDING;
    await this.businessRepo.save(business);

    return kyc;
  }

  async submitGst(businessId: string, gst: string) {
    const kyc = await this.kycRepo.findOne({
      where: { business: { id: businessId } },
      relations: ['business'],
    });

    const res = await this.surepass.verifyGst(gst);

    kyc.gstNumber = gst;
    kyc.gstVerified = res.success === true;
    kyc.gstResponse = res;

    if (kyc.panVerified && kyc.gstVerified) {
      kyc.status = 'VERIFIED';
      kyc.business.status = BusinessStatus.ACTIVE;
      await this.businessRepo.save(kyc.business);
    }

    return this.kycRepo.save(kyc);
  }
}
