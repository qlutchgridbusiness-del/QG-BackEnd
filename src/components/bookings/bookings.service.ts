import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './bookings.entity';
import { Business } from '../business/business.entity';
import { Services } from '../services/services.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookingDto } from './bookings.dto';
import { WhatsappService } from '../notifications/whatsapp.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,

    @InjectRepository(Services)
    private readonly serviceRepo: Repository<Services>,

    private readonly whatsappService: WhatsappService,
  ) {}

  // ================= USER =================

  async createBooking(userId: string, dto: CreateBookingDto) {
    const business = await this.businessRepo.findOne({
      where: { id: dto.businessId },
    });
    if (!business) throw new NotFoundException('Business not found');

    const service = await this.serviceRepo.findOne({
      where: { id: dto.serviceId },
      relations: ['business'],
    });
    if (!service) throw new NotFoundException('Service not found');

    const booking = this.bookingRepo.create({
      user: { id: userId } as any,
      business,
      service,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      totalAmount: null, // decided after service
      status: BookingStatus.REQUESTED,
    });

    return this.bookingRepo.save(booking);
  }

  getMyBookings(userId: string) {
    return this.bookingRepo.find({
      where: { user: { id: userId } },
      relations: ['business', 'service'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyBookingById(userId: string, id: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['user', 'business', 'service'],
    });
    if (!booking) throw new NotFoundException();
    if (booking.user.id !== userId) throw new ForbiddenException();
    return booking;
  }

  async cancelBooking(userId: string, id: string, reason?: string) {
    const booking = await this.getMyBookingById(userId, id);

    if (booking.status !== BookingStatus.REQUESTED)
      throw new ForbiddenException('Cannot cancel');

    booking.status = BookingStatus.CANCELLED;
    booking.cancelReason = reason;
    return this.bookingRepo.save(booking);
  }

  // ================= BUSINESS =================

  getBookingsForBusinessOwner(ownerId: string) {
    return this.bookingRepo.find({
      where: { business: { owner: { id: ownerId } } },
      relations: ['user', 'service'],
      order: { createdAt: 'DESC' },
    });
  }

  async acceptBooking(ownerId: string, bookingId: string) {
    const booking = await this.getBusinessBooking(ownerId, bookingId);

    if (booking.status !== BookingStatus.REQUESTED)
      throw new ForbiddenException();

    booking.status = BookingStatus.BUSINESS_ACCEPTED;
    return this.bookingRepo.save(booking);
  }

  async rejectBooking(ownerId: string, bookingId: string, reason: string) {
    const booking = await this.getBusinessBooking(ownerId, bookingId);

    booking.status = BookingStatus.BUSINESS_REJECTED;
    booking.cancelReason = reason;
    return this.bookingRepo.save(booking);
  }

  async startService(
    ownerId: string,
    bookingId: string,
    beforeImages: string[],
  ) {
    const booking = await this.getBusinessBooking(ownerId, bookingId);

    if (booking.status !== BookingStatus.BUSINESS_ACCEPTED)
      throw new ForbiddenException();

    booking.beforeServiceImages = beforeImages;
    booking.status = BookingStatus.SERVICE_STARTED;

    await this.bookingRepo.save(booking);
    await this.whatsappService.notifyUser(booking, 'SERVICE_STARTED');

    return booking;
  }

  async completeService(
    ownerId: string,
    bookingId: string,
    afterImages: string[],
    amount: number,
  ) {
    const booking = await this.getBusinessBooking(ownerId, bookingId);

    if (booking.status !== BookingStatus.SERVICE_STARTED)
      throw new ForbiddenException();

    booking.afterServiceImages = afterImages;
    booking.totalAmount = amount;
    booking.status = BookingStatus.PAYMENT_PENDING;

    await this.bookingRepo.save(booking);
    await this.whatsappService.notifyUser(booking, 'SERVICE_COMPLETED');

    return booking;
  }

  async markPaymentCompleted(bookingId: string, razorpayPaymentId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException();

    booking.status = BookingStatus.PAYMENT_COMPLETED;
    booking.razorpayPaymentId = razorpayPaymentId;

    return this.bookingRepo.save(booking);
  }

  async deliverVehicle(ownerId: string, bookingId: string) {
    const booking = await this.getBusinessBooking(ownerId, bookingId);

    if (booking.status !== BookingStatus.PAYMENT_COMPLETED)
      throw new ForbiddenException();

    booking.status = BookingStatus.VEHICLE_DELIVERED;
    await this.bookingRepo.save(booking);
    await this.whatsappService.notifyUser(booking, 'VEHICLE_DELIVERED');
  }

  // ================= INTERNAL =================

  private async getBusinessBooking(ownerId: string, bookingId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['business', 'business.owner'],
    });

    if (!booking) throw new NotFoundException();
    if (booking.business.owner.id !== ownerId) throw new ForbiddenException();

    return booking;
  }
}
