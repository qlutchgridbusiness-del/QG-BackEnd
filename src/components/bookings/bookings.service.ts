// src/components/bookings/bookings.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './bookings.entity';
import { Business } from '../business/business.entity';
import { CreateBookingDto } from './bookings.dto';
import { BookingStatus } from './bookings.entity';
import { BusinessStatus } from '../business/business-status.enum';
import { Services } from '../services/services.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,

    @InjectRepository(Services)
    private readonly serviceRepo: Repository<Services>,
  ) {}

  /* USER: create booking */
  async createBooking(userId: string, dto: CreateBookingDto) {
    if (dto.scheduledAt && new Date(dto.scheduledAt) < new Date()) {
      throw new BadRequestException('Cannot book past time');
    }

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
      priceSnapshot:
        service.pricingType === 'FIXED'
          ? service.price
          : service.pricingType === 'RANGE'
            ? service.minPrice
            : null,
      status: BookingStatus.REQUESTED,
    });

    return this.bookingRepo.save(booking);
  }

  /* USER: view my bookings */
  getMyBookings(userId: string) {
    return this.bookingRepo.find({
      where: { user: { id: userId } },
      relations: ['user', 'business', 'service'],
      order: { createdAt: 'DESC' },
    });
  }

  /* USER: booking details */
  async getMyBookingById(userId: string, id: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['user', 'business', 'service'],
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

  // src/components/bookings/bookings.service.ts

  async getBookingsForBusinessOwner(ownerId: string) {
    return this.bookingRepo.find({
      where: {
        business: {
          owner: { id: ownerId },
        },
      },
      relations: ['user', 'service', 'business', 'business.owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async acceptBooking(ownerId: string, bookingId: string) {
    const booking = await this.getBusinessBooking(ownerId, bookingId);

    if (booking.status !== BookingStatus.REQUESTED) {
      throw new ForbiddenException('Cannot accept booking');
    }

    booking.status = BookingStatus.ACCEPTED;
    return this.bookingRepo.save(booking);
  }

  async rejectBooking(ownerId: string, bookingId: string, reason: string) {
    const booking = await this.getBusinessBooking(ownerId, bookingId);

    if (booking.status !== BookingStatus.REQUESTED) {
      throw new ForbiddenException('Cannot reject booking');
    }

    booking.status = BookingStatus.REJECTED;
    booking.cancelReason = reason;

    return this.bookingRepo.save(booking);
  }

  async completeBooking(ownerId: string, bookingId: string) {
    const booking = await this.getBusinessBooking(ownerId, bookingId);

    if (
      booking.status !== BookingStatus.ACCEPTED &&
      booking.status !== BookingStatus.IN_PROGRESS
    ) {
      throw new ForbiddenException('Cannot complete booking');
    }

    booking.status = BookingStatus.COMPLETED;
    return this.bookingRepo.save(booking);
  }

  // 🔐 Internal guard
  private async getBusinessBooking(ownerId: string, bookingId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['business', 'business.owner'],
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.business.owner.id !== ownerId) {
      throw new ForbiddenException('Access denied');
    }

    return booking;
  }
}
