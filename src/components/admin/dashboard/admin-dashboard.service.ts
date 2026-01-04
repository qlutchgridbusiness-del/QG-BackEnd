import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/components/user/user.entity';
import { Business } from 'src/components/business/business.entity';
import { BusinessKyc } from 'src/components/kyc/business-kyc.entity';
import { BusinessStatus } from 'src/components/business/business-status.enum';
import { KycStatus } from 'src/components/admin/kyc/kyc-status.enum';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    @InjectRepository(Business)
    private readonly businesses: Repository<Business>,

    @InjectRepository(BusinessKyc)
    private readonly kycs: Repository<BusinessKyc>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      pendingKyc,
      pendingContracts,
      liveBusinesses,
      rejectedBusinesses,
    ] = await Promise.all([
      this.users.count(),

      this.kycs.count({
        where: { status: KycStatus.PENDING },
      }),

      this.businesses.count({
        where: { status: BusinessStatus.CONTRACT_PENDING },
      }),

      this.businesses.count({
        where: { status: BusinessStatus.ACTIVE },
      }),

      this.businesses.count({
        where: { status: BusinessStatus.KYC_REJECTED },
      }),
    ]);

    return {
      totalUsers,
      pendingKyc,
      pendingContracts,
      liveBusinesses,
      rejectedBusinesses,
    };
  }
}
