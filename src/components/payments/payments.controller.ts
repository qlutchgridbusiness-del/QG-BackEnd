import {
  Body,
  Controller,
  Post,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { BookingService } from '../bookings/bookings.service';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';
import { BookingStatus } from '../bookings/bookings.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly bookingService: BookingService,
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

    if (booking.status !== BookingStatus.SERVICE_COMPLETED) {
      throw new BadRequestException('Service not completed yet');
    }

    booking.status = BookingStatus.PAYMENT_PENDING;
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
      body.razorpay_order_id,
    );

    return {
      success: true,
      paymentId: body.razorpay_payment_id,
    };
  }
}
