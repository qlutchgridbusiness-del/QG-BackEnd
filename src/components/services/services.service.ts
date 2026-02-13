import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Services } from './services.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Services)
    private readonly serviceRepository: Repository<Services>,
  ) {}

  /**
   * Find services with optional filters
   */
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
      .where('b.status = :status', { status: 'ACTIVE' }) // only active businesses
      .andWhere(
        '(b.planDueAt IS NULL OR b.planDueAt >= NOW() OR b.planAmount = 0)',
      )
      .orderBy('s.name', 'ASC');

    // 🔍 Search by service name
    if (search) {
      qb.andWhere('LOWER(s.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    // 🏢 Filter by business
    if (businessId) {
      qb.andWhere('b.id = :businessId', { businessId });
    }

    /**
     * 📍 Nearby filter (NO earthdistance)
     * Simple bounding box approximation (FAST + SAFE)
     */
    if (lat && lng) {
      const latDiff = radiusKm / 111; // ~111km per degree latitude
      const lngDiff = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

      qb.andWhere(
        `
        b.latitude BETWEEN :minLat AND :maxLat
        AND b.longitude BETWEEN :minLng AND :maxLng
        `,
        {
          minLat: lat - latDiff,
          maxLat: lat + latDiff,
          minLng: lng - lngDiff,
          maxLng: lng + lngDiff,
        },
      );
    }

    return qb.getMany();
  }

  /**
   * Get service by ID
   */
  async findOneById(id: string): Promise<Services | null> {
    return this.serviceRepository.findOne({
      where: { id },
      relations: ['business'],
    });
  }
}
