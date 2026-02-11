import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Business } from '../../business/business.entity';
import { BusinessStatus } from '../../business/business-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessKyc } from '../../kyc/business-kyc.entity';

@Injectable()
export class AdminKycService {
  constructor(
    @InjectRepository(Business)
    private businessRepo: Repository<Business>,

    @InjectRepository(BusinessKyc)
    private kycRepo: Repository<BusinessKyc>,
  ) {}

  async approveBusiness(businessId: string) {
    throw new ForbiddenException(
      'KYC approval is automated and not controlled by admin',
    );
    const kyc = await this.kycRepo.findOne({
      where: { business: { id: businessId } },
      relations: ['business'],
    });

    if (!kyc) throw new NotFoundException('KYC not found');

    if (!kyc.panVerified || !kyc.gstVerified) {
      throw new BadRequestException('KYC not fully verified');
    }

    kyc.status = 'VERIFIED';
    kyc.rejectionReason = null;

    kyc.business.status = BusinessStatus.ACTIVE;

    await this.businessRepo.save(kyc.business);
    await this.kycRepo.save(kyc);

    return {
      message: 'Business approved successfully',
      businessId,
      status: 'ACTIVE',
    };
  }

  async rejectBusiness(businessId: string, reason: string) {
    throw new ForbiddenException(
      'KYC rejection is automated and not controlled by admin',
    );
    const kyc = await this.kycRepo.findOne({
      where: { business: { id: businessId } },
      relations: ['business'],
    });

    if (!kyc) throw new NotFoundException('KYC not found');

    kyc.status = 'REJECTED';
    kyc.rejectionReason = reason;

    kyc.business.status = BusinessStatus.KYC_REJECTED;

    await this.businessRepo.save(kyc.business);
    await this.kycRepo.save(kyc);

    return {
      message: 'Business rejected',
      reason,
    };
  }

  async listPendingKycs() {
    return this.kycRepo.find({
      where: { status: 'PENDING' },
      relations: ['business'],
      order: { createdAt: 'ASC' },
    });
  }
}
