// src/components/business/business.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessStatus, ServiceStatus } from './business-status.enum';
import { Business } from './business.entity';
import { CreateBusinessDto } from './business.dto';
import { User } from '../user/user.entity';
import { Services } from '../services/services.entity';
import { CreateServiceDto } from '../services/services.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Services)
    private readonly serviceRepo: Repository<Services>,
  ) {}

  async createBusiness(ownerId: string, dto: CreateBusinessDto) {
    const owner = await this.userRepo.findOne({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('Owner not found');

    const business = this.businessRepo.create({
      ...dto,
      latitude: dto.latitude ? Number(dto.latitude) : null,
      longitude: dto.longitude ? Number(dto.longitude) : null,
      status: BusinessStatus.DRAFT,
      owner,
    });

    return this.businessRepo.save(business);
  }

  async updateBusiness(
    ownerId: string,
    id: string,
    dto: Partial<CreateBusinessDto>,
  ) {
    const business = await this.businessRepo.findOne({
      where: { id, owner: { id: ownerId } },
    });

    if (!business) {
      throw new NotFoundException('Business not found or not owned by user');
    }
    // If a business is still registering (no terms + no active plan),
    // never block service additions even if status was set to SUSPENDED.
    if (
      business.status === BusinessStatus.SUSPENDED &&
      !business.termsAcceptedAt &&
      business.planStatus !== 'ACTIVE'
    ) {
      business.status = BusinessStatus.DRAFT;
      await this.businessRepo.save(business);
    }

    // NEVER allow status changes from business side
    delete (dto as any).status;

    Object.assign(business, dto);
    return this.businessRepo.save(business);
  }

  async getMyBusinesses(ownerId: string) {
    const businesses = await this.businessRepo.find({
      where: { owner: { id: ownerId } },
    });
    const now = Date.now();
    for (const b of businesses) {
      if (
        b.planDueAt &&
        b.planAmount &&
        b.planAmount > 0 &&
        b.planStatus === 'ACTIVE' &&
        b.planDueAt.getTime() < now &&
        b.status === BusinessStatus.ACTIVE
      ) {
        b.status = BusinessStatus.SUSPENDED;
        b.planStatus = 'PENDING';
        await this.businessRepo.save(b);
      }
    }
    return businesses;
  }

  async getNearbyBusinesses(lat: number, lng: number, radiusKm = 10) {
    return this.businessRepo
      .createQueryBuilder('b')
      .where(
        `earth_distance(
          ll_to_earth(:lat, :lng),
          ll_to_earth(b.latitude, b.longitude)
        ) < :radius`,
        {
          lat,
          lng,
          radius: radiusKm * 1000,
        },
      )
      .andWhere('b.status = :status', {
        status: BusinessStatus.ACTIVE,
      })
      .getMany();
  }
  async addServices(
    ownerId: string,
    businessId: string,
    services: CreateServiceDto[],
  ) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId, owner: { id: ownerId } },
      relations: ['services'],
    });

    if (!business) {
      throw new NotFoundException('Business not found or not owned by user');
    }
    const allowedStatuses = [
      BusinessStatus.DRAFT,
      BusinessStatus.PROFILE_COMPLETED,
      BusinessStatus.CONTRACT_PENDING,
      BusinessStatus.KYC_PENDING,
      BusinessStatus.KYC_UNDER_REVIEW,
      BusinessStatus.ACTIVE,
    ];
    if (!allowedStatuses.includes(business.status)) {
      throw new ForbiddenException(
        'Your business is under review. Services can be added after approval.',
      );
    }
    if (
      business.status === BusinessStatus.CONTRACT_PENDING &&
      business.planStatus === 'ACTIVE'
    ) {
      throw new ForbiddenException(
        'Your application is submitted. Services can be updated after approval.',
      );
    }

    const entities = services.map((s) =>
      this.serviceRepo.create({
        ...s,
        business,
        status: ServiceStatus.DRAFT,
      }),
    );

    await this.serviceRepo.save(entities);

    // 🔥 Enforce minimum services rule
    const totalServices = await this.serviceRepo.count({
      where: { business: { id: businessId } },
    });

    if (totalServices >= 3 && business.status === BusinessStatus.DRAFT) {
      business.status = BusinessStatus.PROFILE_COMPLETED;
      await this.businessRepo.save(business);
    }

    return { success: true, totalServices };
  }

  async getBusinessById(ownerId: string, businessId: string) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId, owner: { id: ownerId } },
    });
    if (!business) throw new NotFoundException();
    if (
      business.planDueAt &&
      business.planAmount &&
      business.planAmount > 0 &&
      business.planStatus === 'ACTIVE' &&
      business.planDueAt.getTime() < Date.now() &&
      business.status === BusinessStatus.ACTIVE
    ) {
      business.status = BusinessStatus.SUSPENDED;
      business.planStatus = 'PENDING';
      await this.businessRepo.save(business);
    }
    return business;
  }

  async acceptTerms(
    ownerId: string,
    businessId: string,
    signatureName: string,
    signatureUrl: string,
  ) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId, owner: { id: ownerId } },
    });

    if (!business) {
      throw new NotFoundException('Business not found or not owned by user');
    }

    business.termsSignatureName = signatureName;
    business.termsSignatureUrl = signatureUrl;
    business.termsAcceptedAt = new Date();
    return this.businessRepo.save(business);
  }

  async submitApplication(ownerId: string, businessId: string) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId, owner: { id: ownerId } },
    });
    if (!business) {
      throw new NotFoundException('Business not found or not owned by user');
    }
    if (
      !business.termsAcceptedAt ||
      !business.termsSignatureName ||
      !business.termsSignatureUrl
    ) {
      throw new ForbiddenException(
        'Please accept terms and upload signature before submitting',
      );
    }
    if (!business.planStatus || business.planStatus !== 'ACTIVE') {
      throw new ForbiddenException(
        'Please complete plan payment before submitting',
      );
    }
    business.status = BusinessStatus.CONTRACT_PENDING;
    return this.businessRepo.save(business);
  }

  async getServices(ownerId: string, businessId: string) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId, owner: { id: ownerId } },
    });
    if (!business) throw new ForbiddenException();

    return this.serviceRepo.find({
      where: { business: { id: business.id } },
      order: { name: 'ASC' },
    });
  }

  async updateSettings(ownerId: string, businessId: string, dto: any) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId, owner: { id: ownerId } },
    });

    if (!business) {
      throw new NotFoundException('Business not found or not owned by user');
    }
    if (business.status !== BusinessStatus.ACTIVE) {
      throw new ForbiddenException(
        'Your business is under review. Settings can be updated after approval.',
      );
    }

    Object.assign(business, {
      acceptingOrders: dto.acceptingOrders,
      workingDays: dto.workingDays,
      morningStart: dto.morningStart,
      morningEnd: dto.morningEnd,
      eveningStart: dto.eveningStart,
      eveningEnd: dto.eveningEnd,
      breaks: dto.breaks,
      holidays: dto.holidays,
      maxBookingsPerDay: dto.maxBookingsPerDay,
      radius: dto.radius,
      location: dto.location,
    });

    return this.businessRepo.save(business);
  }

  async updateService(ownerId: string, serviceId: string, dto: any) {
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId },
      relations: ['business'],
    });

    if (!service) throw new NotFoundException();
    if (service.business.owner.id !== ownerId) throw new ForbiddenException();
    if (service.business.status !== BusinessStatus.ACTIVE) {
      throw new ForbiddenException(
        'Your business is under review. Services can be updated after approval.',
      );
    }

    Object.assign(service, dto);
    return this.serviceRepo.save(service);
  }
}
