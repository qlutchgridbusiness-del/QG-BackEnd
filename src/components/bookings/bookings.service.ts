// src/components/bookings/bookings.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './bookings.entity';
import { Business } from '../business/business.entity';
import { BusinessServiceEntity } from '../business-services/business-service.entity';
import { CreateBookingDto } from './bookings.dto';
import { BookingStatus } from './bookings.entity';
import { BusinessStatus } from '../business/business-status.enum';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,

    @InjectRepository(BusinessServiceEntity)
    private readonly serviceRepo: Repository<BusinessServiceEntity>,
  ) {}

  /* USER: create booking */
  async createBooking(userId: string, dto: CreateBookingDto) {
    const business = await this.businessRepo.findOne({
      where: { id: dto.businessId },
    });
    if (!business) throw new NotFoundException('Business not found');

    if (business.status !== BusinessStatus.ACTIVE) {
      throw new ForbiddenException('Business not active');
    }

    const service = await this.serviceRepo.findOne({
      where: { id: dto.serviceId },
      relations: ['business'],
    });
    if (!service) throw new NotFoundException('Service not found');

    if (service.business.id !== business.id) {
      throw new ForbiddenException('Service mismatch');
    }

    const booking = this.bookingRepo.create({
      user: { id: userId } as any,
      business,
      service,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      priceSnapshot: service.price,
      status: BookingStatus.REQUESTED,
    });

    return this.bookingRepo.save(booking);
  }

  /* USER: view my bookings */
  getMyBookings(userId: string) {
    return this.bookingRepo.find({
      where: { user: { id: userId } },
      relations: ['business', 'service'],
      order: { createdAt: 'DESC' },
    });
  }

  /* USER: booking details */
  async getMyBookingById(userId: string, id: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['business', 'service'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user.id !== userId) throw new ForbiddenException();
    return booking;
  }

  /* USER: cancel booking */
  async cancelBooking(userId: string, id: string, reason?: string) {
    const booking = await this.getMyBookingById(userId, id);

    if (booking.status !== BookingStatus.REQUESTED) {
      throw new ForbiddenException('Cannot cancel this booking');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancelReason = reason;

    return this.bookingRepo.save(booking);
  }
}
