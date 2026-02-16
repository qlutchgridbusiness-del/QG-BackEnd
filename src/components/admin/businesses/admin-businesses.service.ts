import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from 'src/components/business/business.entity';
import { BusinessStatus } from 'src/components/business/business-status.enum';
import { PushService } from 'src/components/push/push.service';
@Injectable()
export class AdminBusinessesService {
  constructor(
    @InjectRepository(Business) private businesses: Repository<Business>,
    private readonly pushService: PushService,
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
    const business = await this.getBusiness(id);
    if (business.status !== BusinessStatus.CONTRACT_PENDING) {
      throw new BadRequestException('Business is not pending contract approval');
    }
    if (!business.termsAcceptedAt) {
      throw new BadRequestException('Terms not accepted by business');
    }
    if (!business.termsSignatureName || !business.termsSignatureUrl) {
      throw new BadRequestException('Digital signature is missing');
    }
    await this.businesses.update(id, { status: BusinessStatus.ACTIVE });
    return { message: 'Business activated' };
  }

  async suspendBusiness(id: string) {
    await this.getBusiness(id);
    await this.businesses.update(id, { status: BusinessStatus.SUSPENDED });
    return { message: 'Business suspended' };
  }

  async requestSignatureReupload(id: string) {
    const business = await this.getBusiness(id);
    business.termsSignatureName = null;
    business.termsSignatureUrl = null;
    business.termsAcceptedAt = null;
    business.status = BusinessStatus.CONTRACT_PENDING;
    await this.businesses.save(business);
    if (business.owner?.id) {
      await this.pushService.notifyUser(business.owner.id, {
        title: 'Signature Re-upload Required',
        body: 'Please review the partner agreement and upload your signature again.',
        url: '/auth/register/business?pending=1',
      });
    }
    return { message: 'Signature re-upload requested' };
  }
}
