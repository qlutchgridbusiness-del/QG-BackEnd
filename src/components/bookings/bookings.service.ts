import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './bookings.entity';
import { CreateBookingDto } from './bookings.dto';
import { BusinessServiceEntity } from '../business-services/business-service.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,

    @InjectRepository(BusinessServiceEntity)
    private readonly serviceRepo: Repository<BusinessServiceEntity>, // 👈 Add this
  ) {}

  async create(dto: CreateBookingDto) {
    // ✅ 1. Fetch service to derive businessId
    console.log("servicecheck------->", dto.serviceId);
    const service = await this.serviceRepo.findOne({
      where: { id: dto.serviceId },
      relations: ['business'], // ensure you get business relation
    });
        console.log("servicecheck------->", service);


    if (!service) throw new NotFoundException('Service not found');

    // ✅ 2. Create booking with derived businessId
    const booking = this.bookingsRepo.create({
      userId: dto.userId,
      businessId: service.business.id, // 👈 derive here
      serviceId: dto.serviceId,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      status: 'created',
      paymentStatus: 'pending',
    });

    return this.bookingsRepo.save(booking);
  }

  async getAll() {
    return this.bookingsRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['service', 'user'], // optional but useful
    });
  }

  async getById(id: string) {
    const booking = await this.bookingsRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus) {
    const booking = await this.getById(id);
    booking.status = status;
    return this.bookingsRepo.save(booking);
  }

  async requestReschedule(id: string, newDate: string) {
    const booking = await this.getById(id);
    booking.scheduledAt = new Date(newDate);
    booking.status = 'reschedule_requested';
    return this.bookingsRepo.save(booking);
  }

  async uploadPreServiceImage(id: string, imageUrl: string) {
    const booking = await this.getById(id);
    booking.preServiceImageUrl = imageUrl;
    booking.status = 'in_service';
    return this.bookingsRepo.save(booking);
  }

  async markCompleted(id: string, completionUrl: string) {
    const booking = await this.getById(id);
    booking.completionImageUrl = completionUrl;
    booking.status = 'completed';
    return this.bookingsRepo.save(booking);
  }
}
