import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from 'src/components/business/business.entity';
import { BusinessStatus } from 'src/components/business/business-status.enum';
@Injectable()
export class AdminBusinessesService {
  constructor(
    @InjectRepository(Business) private businesses: Repository<Business>,
  ) {}

  listBusinesses() {
    return this.businesses.find({ relations: ['owner'] });
  }

  async getBusiness(id: string) {
    const business = await this.businesses.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async activateBusiness(id: string) {
    await this.getBusiness(id);
    await this.businesses.update(id, { status: BusinessStatus.ACTIVE });
    return { message: 'Business activated' };
  }

  async suspendBusiness(id: string) {
    await this.getBusiness(id);
    await this.businesses.update(id, { status: BusinessStatus.KYC_REJECTED });
    return { message: 'Business suspended' };
  }
}
