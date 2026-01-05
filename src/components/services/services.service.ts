import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessServiceEntity } from '../business-services/business-service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(BusinessServiceEntity)
    private readonly serviceRepository: Repository<BusinessServiceEntity>,
  ) {}

  async findFiltered(params: {
    search?: string;
    businessId?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }) {
    const { search, businessId, lat, lng, radiusKm = 10 } = params;

    const qb = this.serviceRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.business', 'b')
      .orderBy('s.name', 'ASC');

    // 🔍 Search
    if (search) {
      qb.andWhere('LOWER(s.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    // 🏢 Filter by business
    if (businessId) {
      qb.andWhere('b.id = :businessId', { businessId });
    }

    // 📍 Nearby filter
    if (lat && lng) {
      qb.andWhere(
        `
      earth_distance(
        ll_to_earth(:lat, :lng),
        ll_to_earth(b.latitude, b.longitude)
      ) <= :radius
      `,
        {
          lat,
          lng,
          radius: radiusKm * 1000,
        },
      );
    }

    return qb.getMany();
  }

  async findOneById(id: string): Promise<BusinessServiceEntity | null> {
    return this.serviceRepository.findOne({
      where: { id },
      relations: ['business'], // 👈 so frontend gets business info too
    });
  }
}
