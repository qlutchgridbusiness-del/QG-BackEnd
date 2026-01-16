import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // STEP 1: Create order
  @Post('create-order')
  async createOrder(
    @Body()
    body: {
      amount: number; // in paise
      receipt: string;
    },
  ) {
    if (!body.amount) {
      throw new BadRequestException('Invalid amount');
    }

    const order = await this.paymentsService.createOrder(
      body.amount,
      body.receipt,
    );

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID, // safe to expose
    };
  }

  // STEP 2: Verify payment
  @Post('verify')
  async verifyPayment(
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
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

    // 🔒 PRODUCTION: Save payment + activate plan here

    return {
      success: true,
      paymentId: body.razorpay_payment_id,
    };
  }
}
