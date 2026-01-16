import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

@Injectable()
export class PaymentsService {
  private readonly instance: Razorpay;

  constructor() {
    this.instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  /**
   * amountPaise: ₹10 = 1000
   */
  async createOrder(amountPaise: number, receipt: string, currency = 'INR') {
    return this.instance.orders.create({
      amount: amountPaise,
      currency,
      receipt: `qg_${receipt}`,
      payment_capture: true, // auto-capture
    });
  }

  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const body = `${orderId}|${paymentId}`;

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    return expected === signature;
  }
}
