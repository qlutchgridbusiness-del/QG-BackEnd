import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from 'src/components/business/business.entity';
import { BusinessStatus } from 'src/components/business/business-status.enum';

@Injectable()
export class AdminContractsService {
  constructor(
    @InjectRepository(Business) private businesses: Repository<Business>,
  ) {}

  listPendingContracts() {
    return this.businesses.find({
      where: { status: BusinessStatus.CONTRACT_PENDING },
    });
  }

  async signContract(businessId: string) {
    const business = await this.businesses.findOne({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException('Business not found');
    if (business.status !== BusinessStatus.CONTRACT_PENDING) {
      throw new BadRequestException('Business is not pending contract approval');
    }
    if (!business.termsAcceptedAt) {
      throw new BadRequestException('Terms not accepted by business');
    }
    if (!business.termsSignatureName || !business.termsSignatureUrl) {
      throw new BadRequestException('Digital signature is missing');
    }
    if (!business.planStatus || business.planStatus !== 'ACTIVE') {
      throw new BadRequestException('Plan payment is not completed');
    }
    if (!business.planId || !business.planActivatedAt) {
      throw new BadRequestException('Plan details are incomplete');
    }
    business.status = BusinessStatus.ACTIVE;
    await this.businesses.save(business);

    return { message: 'Contract signed & business activated' };
  }
}
