// src/components/kyc/kyc.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KycService {
  private baseUrl = process.env.SUREPASS_BASE_URL!;
  private token = process.env.SUREPASS_TOKEN!;
  private customerId = process.env.SUREPASS_CUSTOMER_ID!;

  private headers = {
    Authorization: this.token,
    'Content-Type': 'application/json',
    'X-Customer-Id': this.customerId,
  };

  async verifyPan(pan: string) {
    Logger.log('check-------------->', `${this.baseUrl}/pan/pan`);
    const res = await axios.post(
      `${this.baseUrl}/pan/pan`,
      { id_number: pan },
      { headers: this.headers },
    );
    return res.data;
  }

  async verifyGst(gst: string) {
    const res = await axios.post(
      `${this.baseUrl}/corporate/gstin`,
      { id_number: gst },
      { headers: this.headers },
    );
    return res.data;
  }
}
