import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async submitPan(ownerId: string, businessId: string, pan: string) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId, owner: { id: ownerId } },
      relations: ['owner'],
    });
    if (!business) throw new NotFoundException('Business not found');

    const res = await this.surepass.verifyPan(pan);

    const kyc = await this.kycRepo.save({
      business,
      panNumber: pan,
      panVerified: res.success === true,
      panResponse: res,
      status: res.success === true ? 'VERIFIED' : 'REJECTED',
      rejectionReason: res.success === true ? null : res.message,
    });

    business.panVerified = res.success === true;
    business.status = BusinessStatus.KYC_PENDING;
    await this.businessRepo.save(business);

    if (res.success !== true) {
      throw new BadRequestException(res.message || 'Invalid PAN');
    }

    return kyc;
  }

  async submitGst(ownerId: string, businessId: string, gst: string) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId, owner: { id: ownerId } },
      relations: ['owner'],
    });
    if (!business) throw new NotFoundException('Business not found');

    const kyc = await this.kycRepo.findOne({
      where: { business: { id: businessId } },
      relations: ['business'],
    });
    if (!kyc) {
      throw new NotFoundException('KYC record not found. Submit PAN first.');
    }

    const res = await this.surepass.verifyGst(gst);

    kyc.gstNumber = gst;
    kyc.gstVerified = res.success === true;
    kyc.gstResponse = res;
    business.gstVerified = res.success === true;
    if (res.success !== true) {
      kyc.status = 'REJECTED';
      kyc.rejectionReason = res.message || 'Invalid GST';
      await this.kycRepo.save(kyc);
      throw new BadRequestException(kyc.rejectionReason);
    }

    if (kyc.panVerified) {
      kyc.status = 'VERIFIED';
    }

    await this.businessRepo.save(business);

    return this.kycRepo.save(kyc);
  }

  async getStatus(ownerId: string, businessId: string) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId, owner: { id: ownerId } },
      relations: ['owner'],
    });
    if (!business) throw new NotFoundException('Business not found');

    const kyc = await this.kycRepo.findOne({
      where: { business: { id: businessId } },
      relations: ['business'],
    });

    return (
      kyc || {
        business,
        panVerified: false,
        gstVerified: false,
        status: 'PENDING',
      }
    );
  }
}
