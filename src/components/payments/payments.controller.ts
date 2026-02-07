import {
  Body,
  Controller,
  Post,
  BadRequestException,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { BookingService } from '../bookings/bookings.service';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';
import { BookingStatus } from '../bookings/bookings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../business/business.entity';
import { BusinessStatus } from '../business/business-status.enum';

const PLAN_PRICES: Record<string, number> = {
  STARTER: 0,
  STANDARD: 15000,
  GROWTH: 100000,
  ELITE: 5999,
};

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly bookingService: BookingService,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}

  // STEP 1️⃣ Create Razorpay order (USER)
  @Post('create-order')
  async createOrder(
    @Req() req,
    @Body()
    body: {
      bookingId: string;
    },
  ) {
    const booking = await this.bookingService.getMyBookingById(
      req.user.id,
      body.bookingId,
    );

    if (
      booking.status !== BookingStatus.SERVICE_COMPLETED &&
      booking.status !== BookingStatus.PAYMENT_PENDING
    ) {
      throw new BadRequestException('Service not completed yet');
    }

    booking.status = BookingStatus.PAYMENT_PENDING;
    await this.bookingService.saveBooking(booking);
    const order = await this.paymentsService.createOrder(
      booking.totalAmount * 100,
      booking.id,
    );

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  }

  // STEP 2️⃣ Verify payment
  @Post('verify')
  async verifyPayment(
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      bookingId: string;
    },
  ) {
    const isValid = this.paymentsService.verifySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
    );

    if (!isValid) {
      throw new BadRequestException('Payment verification failed');
    }

    await this.bookingService.markPaymentCompleted(
      body.bookingId,
      body.razorpay_payment_id,
      false,
    );

    return {
      success: true,
      paymentId: body.razorpay_payment_id,
    };
  }

  // STEP 1️⃣ Create Razorpay order (BUSINESS PLAN)
  @Post('plan/create-order')
  async createPlanOrder(
    @Req() req,
    @Body()
    body: {
      businessId: string;
      planId: string;
    },
  ) {
    const price = PLAN_PRICES[body.planId];
    if (price === undefined) {
      throw new BadRequestException('Invalid plan');
    }

    if (price === 0) {
      return { free: true };
    }

    const business = await this.businessRepo.findOne({
      where: { id: body.businessId, owner: { id: req.user.id } },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (!business.termsAcceptedAt || !business.termsSignatureName) {
      throw new BadRequestException('Please accept terms before payment');
    }

    const order = await this.paymentsService.createOrder(
      price * 100,
      `plan_${business.id}_${body.planId}_${Date.now()}`,
    );

    business.planId = body.planId;
    business.planAmount = price;
    business.planOrderId = order.id;
    business.planStatus = 'PENDING';
    await this.businessRepo.save(business);

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  }

  // STEP 2️⃣ Verify payment (BUSINESS PLAN)
  @Post('plan/verify')
  async verifyPlanPayment(
    @Req() req,
    @Body()
    body: {
      businessId: string;
      planId: string;
      free?: boolean;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    },
  ) {
    const price = PLAN_PRICES[body.planId];
    if (price === undefined) {
      throw new BadRequestException('Invalid plan');
    }

    const business = await this.businessRepo.findOne({
      where: { id: body.businessId, owner: { id: req.user.id } },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (price === 0 || body.free) {
      if (!business.termsAcceptedAt || !business.termsSignatureName) {
        throw new BadRequestException('Please accept terms before activation');
      }
      business.planId = body.planId;
      business.planAmount = 0;
      business.planStatus = 'ACTIVE';
      business.planActivatedAt = new Date();
      business.status = BusinessStatus.ACTIVE;
      await this.businessRepo.save(business);

      return { success: true, free: true };
    }

    if (
      !body.razorpay_order_id ||
      !body.razorpay_payment_id ||
      !body.razorpay_signature
    ) {
      throw new BadRequestException('Missing payment details');
    }

    const isValid = this.paymentsService.verifySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
    );

    if (!isValid) {
      throw new BadRequestException('Payment verification failed');
    }

    business.planId = body.planId;
    business.planAmount = price;
    business.planOrderId = body.razorpay_order_id;
    business.planPaymentId = body.razorpay_payment_id;
    business.planStatus = 'ACTIVE';
    business.planActivatedAt = new Date();
    business.status = BusinessStatus.ACTIVE;
    await this.businessRepo.save(business);

    return {
      success: true,
      paymentId: body.razorpay_payment_id,
    };
  }
}
