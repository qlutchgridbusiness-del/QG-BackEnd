import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { BusinessServiceEntity } from '../business-services/business-service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(BusinessServiceEntity)
    private readonly serviceRepository: Repository<BusinessServiceEntity>,
  ) {}

  async findFiltered(search?: string, businessId?: string) {
    const where: any = {};
    if (search) where.name = ILike(`%${search}%`);
    if (businessId) where.business = { id: businessId };

    return this.serviceRepository.find({
      where,
      relations: ['business'],
      order: { name: 'ASC' },
    });
  }

  async findOneById(id: string): Promise<BusinessServiceEntity | null> {
    return this.serviceRepository.findOne({
      where: { id },
      relations: ['business'], // 👈 so frontend gets business info too
    });
  }
}
