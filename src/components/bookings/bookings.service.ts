import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from '../business/business.entity';
import { Booking } from './bookings.entity';
import { Repository } from 'typeorm';
import { BusinessServiceEntity } from '../business-services/business-service.entity';
import { CreateBookingDto } from './bookings.dto';
import { BusinessStatus } from '../business/business-status.enum';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,

    @InjectRepository(Business)
    private businessRepo: Repository<Business>,

    @InjectRepository(BusinessServiceEntity)
    private serviceRepo: Repository<BusinessServiceEntity>,
  ) {}

  async createBooking(userId: string, dto: CreateBookingDto) {
    const business = await this.businessRepo.findOne({
      where: { id: dto.businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // 🔒 KYC LOCK
    if (business.status !== BusinessStatus.ACTIVE) {
      throw new ForbiddenException(
        'Business is not verified yet. Booking not allowed.',
      );
    }

    const service = await this.serviceRepo.findOne({
      where: { id: dto.serviceId },
      relations: ['business'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.business.id !== business.id) {
      throw new ForbiddenException('Service does not belong to this business');
    }

    const booking = this.bookingRepo.create({
      user: { id: userId } as any,
      business,
      service,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    });

    return this.bookingRepo.save(booking);
  }
}
