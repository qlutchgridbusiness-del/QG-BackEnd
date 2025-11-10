// src/components/payments/payments.service.ts
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

  /** amount in paise */
  async createOrder(amountPaise: number, receipt: string, currency = 'INR') {
    const order = await this.instance.orders.create({
      amount: amountPaise,
      currency,
      receipt,
    });
    return order; // { id, amount, currency, status, ... }
  }

  /** Verify payment signature sent by client after success */
  verifySignature(orderId: string, paymentId: string, signature: string) {
    const body = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');
    return expected === signature;
  }
}
