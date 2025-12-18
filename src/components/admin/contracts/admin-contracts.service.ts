import { Injectable } from '@nestjs/common';
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
      where: { status: BusinessStatus.KYC_PENDING },
    });
  }

  async signContract(businessId: string) {
    await this.businesses.update(businessId, {
      status: BusinessStatus.ACTIVE,
    });

    return { message: 'Contract signed & business activated' };
  }
}
