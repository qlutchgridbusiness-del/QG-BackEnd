import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/components/user/user.entity';
import { Business } from 'src/components/business/business.entity';
import { BusinessKyc } from 'src/components/kyc/business-kyc.entity';
import { BusinessStatus } from 'src/components/business/business-status.enum';
@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Business) private businesses: Repository<Business>,
    @InjectRepository(BusinessKyc) private kycs: Repository<BusinessKyc>,
  ) {}

  async getDashboardStats() {
    return {
      totalUsers: await this.users.count(),
      totalBusinesses: await this.businesses.count(),
      pendingKycs: await this.kycs.count({ where: { status: 'PENDING' } }),
      activeBusinesses: await this.businesses.count({
        where: { status: BusinessStatus.ACTIVE },
      }),
    };
  }
}
