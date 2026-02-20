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
import { CreateBookingDto, ProposeQuoteDto } from './bookings.dto';
import { WhatsappService } from '../notifications/whatsapp.service';
import { DltService } from '../notifications/dlt.service';
import { PushService } from '../push/push.service';

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
    private readonly pushService: PushService,
    private readonly dltService: DltService,
  ) {}

  // ================= USER =================

  async createBooking(userId: string, dto: CreateBookingDto) {
    const business = await this.businessRepo.findOne({
      where: { id: dto.businessId },
      relations: ['owner'],
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
      vehicleBrand: dto.vehicleBrand || null,
      vehicleType: dto.vehicleType || null,
      requestNotes: dto.requestNotes || null,
    });

    const saved = await this.bookingRepo.save(booking);

    // 🔔 Notify business owner via web push
    if (business?.owner?.id) {
      await this.pushService.notifyUser(business.owner.id, {
        title: 'New Booking Request',
        body: `${service.name} • ${saved.id.slice(0, 6)}`,
        url: '/business-dashboard/bookings',
      });
    }

    await this.whatsappService.notifyUser(saved, 'BOOKING_CREATED');
    await this.whatsappService.notifyBusiness(saved, 'BOOKING_CREATED');
    await this.dltService.notifyUser(saved, 'BOOKING_CREATED');
    await this.dltService.notifyBusiness(saved, 'BOOKING_CREATED');

    return saved;
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
    const saved = await this.bookingRepo.save(booking);
    await this.whatsappService.notifyBusiness(saved, 'BOOKING_CANCELLED');
    await this.dltService.notifyBusiness(saved, 'BOOKING_CANCELLED');
    if (saved.business?.owner?.id) {
      await this.pushService.notifyUser(saved.business.owner.id, {
        title: 'Booking Cancelled',
        body: `Booking ${saved.id.slice(0, 6)} was cancelled by the user.`,
        url: '/business-dashboard/bookings',
      });
    }
    return saved;
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

    if (
      booking.service?.pricingType &&
      ['RANGE', 'QUOTE'].includes(booking.service.pricingType) &&
      !booking.quoteAmount
    ) {
      throw new ForbiddenException(
        'Quote required before accepting this booking',
      );
    }

    booking.status = BookingStatus.BUSINESS_ACCEPTED;
    const saved = await this.bookingRepo.save(booking);
    await this.whatsappService.notifyUser(saved, 'BOOKING_ACCEPTED');
    await this.whatsappService.notifyBusiness(saved, 'BOOKING_ACCEPTED');
    await this.dltService.notifyUser(saved, 'BOOKING_ACCEPTED');
    await this.dltService.notifyBusiness(saved, 'BOOKING_ACCEPTED');
    if (saved.user?.id) {
      await this.pushService.notifyUser(saved.user.id, {
        title: 'Booking Accepted',
        body: `Your booking has been accepted by ${saved.business?.name}.`,
        url: `/user-dashboard/bookings/${saved.id}`,
      });
    }
    if (saved.business?.owner?.id) {
      await this.pushService.notifyUser(saved.business.owner.id, {
        title: 'Booking Accepted',
        body: `You accepted booking ${saved.id.slice(0, 6)}.`,
        url: '/business-dashboard/bookings',
      });
    }
    return saved;
  }

  async proposeQuote(ownerId: string, bookingId: string, dto: ProposeQuoteDto) {
    const booking = await this.getBusinessBooking(ownerId, bookingId);
    if (booking.status !== BookingStatus.REQUESTED)
      throw new ForbiddenException();

    if (!dto.quoteAmount || dto.quoteAmount <= 0) {
      throw new ForbiddenException('Valid quote amount required');
    }

    booking.quoteAmount = dto.quoteAmount;
    booking.status = BookingStatus.QUOTE_PROPOSED;
    const saved = await this.bookingRepo.save(booking);

    if (saved.user?.id) {
      await this.pushService.notifyUser(saved.user.id, {
        title: 'Quote Proposed',
        body: `Quote received for ${saved.service?.name}. Please confirm to proceed.`,
        url: `/user-dashboard/bookings/${saved.id}`,
      });
    }

    return saved;
  }

  async rejectBooking(ownerId: string, bookingId: string, reason: string) {
    const booking = await this.getBusinessBooking(ownerId, bookingId);

    booking.status = BookingStatus.BUSINESS_REJECTED;
    booking.cancelReason = reason;
    const saved = await this.bookingRepo.save(booking);
    await this.whatsappService.notifyUser(saved, 'BOOKING_REJECTED');
    await this.whatsappService.notifyBusiness(saved, 'BOOKING_REJECTED');
    await this.dltService.notifyUser(saved, 'BOOKING_REJECTED');
    await this.dltService.notifyBusiness(saved, 'BOOKING_REJECTED');
    if (saved.user?.id) {
      await this.pushService.notifyUser(saved.user.id, {
        title: 'Booking Rejected',
        body: `Your booking was rejected by ${saved.business?.name}.`,
        url: `/user-dashboard/bookings/${saved.id}`,
      });
    }
    if (saved.business?.owner?.id) {
      await this.pushService.notifyUser(saved.business.owner.id, {
        title: 'Booking Rejected',
        body: `You rejected booking ${saved.id.slice(0, 6)}.`,
        url: '/business-dashboard/bookings',
      });
    }
    return saved;
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
    await this.whatsappService.notifyBusiness(booking, 'SERVICE_STARTED');
    await this.dltService.notifyUser(booking, 'SERVICE_STARTED');
    await this.dltService.notifyBusiness(booking, 'SERVICE_STARTED');
    if (booking.user?.id) {
      await this.pushService.notifyUser(booking.user.id, {
        title: 'Service Started',
        body: `Service has started for your booking.`,
        url: `/user-dashboard/bookings/${booking.id}`,
      });
    }
    if (booking.business?.owner?.id) {
      await this.pushService.notifyUser(booking.business.owner.id, {
        title: 'Service Started',
        body: `Service started for booking ${booking.id.slice(0, 6)}.`,
        url: '/business-dashboard/bookings',
      });
    }

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
    await this.whatsappService.notifyBusiness(booking, 'SERVICE_COMPLETED');
    await this.dltService.notifyUser(booking, 'PAYMENT_PENDING');
    await this.dltService.notifyBusiness(booking, 'PAYMENT_PENDING');
    if (booking.user?.id) {
      await this.pushService.notifyUser(booking.user.id, {
        title: 'Service Completed',
        body: `Your service is completed. Please pay to pick up your vehicle.`,
        url: `/user-dashboard/bookings/${booking.id}`,
      });
    }
    if (booking.business?.owner?.id) {
      await this.pushService.notifyUser(booking.business.owner.id, {
        title: 'Service Completed',
        body: `Service completed for booking ${booking.id.slice(0, 6)}.`,
        url: '/business-dashboard/bookings',
      });
    }

    return booking;
  }

  async markPaymentCompleted(
    bookingId: string,
    razorpayPaymentId: string,
    autoDeliver = false,
  ) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['user', 'business', 'business.owner'],
    });
    if (!booking) throw new NotFoundException();

    booking.status = BookingStatus.PAYMENT_COMPLETED;
    booking.razorpayPaymentId = razorpayPaymentId;

    const saved = await this.bookingRepo.save(booking);
    await this.whatsappService.notifyUser(saved, 'PAYMENT_COMPLETED');
    await this.whatsappService.notifyBusiness(saved, 'PAYMENT_COMPLETED');
    await this.dltService.notifyUser(saved, 'PAYMENT_COMPLETED');
    await this.dltService.notifyBusiness(saved, 'PAYMENT_COMPLETED');
    if (saved.user?.id) {
      await this.pushService.notifyUser(saved.user.id, {
        title: 'Payment Completed',
        body: `Payment received. You can pick up your vehicle.`,
        url: `/user-dashboard/bookings/${saved.id}`,
      });
    }
    if (saved.business?.owner?.id) {
      await this.pushService.notifyUser(saved.business.owner.id, {
        title: 'Payment Completed',
        body: `Payment received for booking ${saved.id.slice(0, 6)}.`,
        url: '/business-dashboard/bookings',
      });
    }

    if (autoDeliver) {
      saved.status = BookingStatus.VEHICLE_DELIVERED;
      await this.bookingRepo.save(saved);
      await this.whatsappService.notifyUser(saved, 'VEHICLE_DELIVERED');
      await this.dltService.notifyUser(saved, 'VEHICLE_DELIVERED');
    }

    return saved;
  }

  async deliverVehicle(ownerId: string, bookingId: string) {
    const booking = await this.getBusinessBooking(ownerId, bookingId);

    if (booking.status !== BookingStatus.PAYMENT_COMPLETED)
      throw new ForbiddenException();

    booking.status = BookingStatus.VEHICLE_DELIVERED;
    await this.bookingRepo.save(booking);
    await this.whatsappService.notifyUser(booking, 'VEHICLE_DELIVERED');
    await this.whatsappService.notifyBusiness(booking, 'VEHICLE_DELIVERED');
    await this.dltService.notifyUser(booking, 'VEHICLE_DELIVERED');
    await this.dltService.notifyBusiness(booking, 'VEHICLE_DELIVERED');
    if (booking.user?.id) {
      await this.pushService.notifyUser(booking.user.id, {
        title: 'Vehicle Delivered',
        body: `Your vehicle has been delivered. Thank you!`,
        url: `/user-dashboard/bookings/${booking.id}`,
      });
    }
    if (booking.business?.owner?.id) {
      await this.pushService.notifyUser(booking.business.owner.id, {
        title: 'Vehicle Delivered',
        body: `Booking ${booking.id.slice(0, 6)} marked delivered.`,
        url: '/business-dashboard/bookings',
      });
    }
  }

  async requestPickup(userId: string, bookingId: string) {
    const booking = await this.getMyBookingById(userId, bookingId);

    if (booking.status !== BookingStatus.PAYMENT_COMPLETED)
      throw new ForbiddenException('Payment not completed');

    await this.whatsappService.notifyBusiness(booking, 'PAYMENT_COMPLETED');
    await this.dltService.notifyBusiness(booking, 'PAYMENT_COMPLETED');

    if (booking.business?.owner?.id) {
      await this.pushService.notifyUser(booking.business.owner.id, {
        title: 'Pickup Requested',
        body: `User is ready to pick up vehicle for booking ${booking.id.slice(0, 6)}.`,
        url: '/business-dashboard/bookings',
      });
    }

    return { success: true };
  }

  async acceptQuote(userId: string, bookingId: string) {
    const booking = await this.getMyBookingById(userId, bookingId);

    if (booking.status !== BookingStatus.QUOTE_PROPOSED)
      throw new ForbiddenException('No quote to accept');

    booking.status = BookingStatus.BUSINESS_ACCEPTED;
    const saved = await this.bookingRepo.save(booking);

    if (saved.business?.owner?.id) {
      await this.pushService.notifyUser(saved.business.owner.id, {
        title: 'Quote Accepted',
        body: `User accepted quote for booking ${saved.id.slice(0, 6)}.`,
        url: '/business-dashboard/bookings',
      });
    }
    if (saved.user?.id) {
      await this.pushService.notifyUser(saved.user.id, {
        title: 'Booking Confirmed',
        body: `Your booking is confirmed. Business will start the service.`,
        url: `/user-dashboard/bookings/${saved.id}`,
      });
    }

    return saved;
  }

  // ================= INTERNAL =================

  private async getBusinessBooking(ownerId: string, bookingId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['business', 'business.owner', 'user', 'service'],
    });

    if (!booking) throw new NotFoundException();
    if (booking.business.owner.id !== ownerId) throw new ForbiddenException();

    return booking;
  }

  async saveBooking(booking: Booking) {
    return this.bookingRepo.save(booking);
  }
}
