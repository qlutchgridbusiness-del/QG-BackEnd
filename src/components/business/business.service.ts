// src/components/business/business.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessStatus } from './business-status.enum';
import { Business } from './business.entity';
import { CreateBusinessDto } from './business.dto';
import { User } from '../user/user.entity';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

  async updateBusiness(id: string, dto: Partial<CreateBusinessDto>) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business) throw new NotFoundException('Business not found');

    Object.assign(business, dto);
    return this.businessRepo.save(business);
  }

  async getMyBusinesses(ownerId: string) {
    return this.businessRepo.find({
      where: { owner: { id: ownerId } },
    });
  }

  async approveBusiness(id: string) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business) throw new NotFoundException('Business not found');

    business.status = BusinessStatus.ACTIVE;
    return this.businessRepo.save(business);
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
}
