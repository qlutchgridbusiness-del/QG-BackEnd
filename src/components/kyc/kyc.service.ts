// src/components/kyc/kyc.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KycService {
  private baseUrl = process.env.SUREPASS_API_URL!;
  private token = process.env.SUREPASS_API_KEY!;

  private getAuthHeader() {
    const raw = this.token || '';
    return raw.toLowerCase().startsWith('bearer ') ? raw : `Bearer ${raw}`;
  }

  private get headers() {
    return {
      Authorization: this.getAuthHeader(),
      'Content-Type': 'application/json',
    };
  }

  private normalizeError(err: any) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const message =
      data?.message || data?.error || err?.message || 'Verification failed';
    Logger.error(
      `Surepass error: ${status || 'unknown'} ${message}`,
      JSON.stringify(data || {}),
    );
    return {
      success: false,
      status_code: status || 500,
      message,
      data: null,
    };
  }

  async verifyPan(pan: string) {
    Logger.log('check-------------->', `${this.baseUrl}/pan/pan`);
    try {
      const res = await axios.post(
        `${this.baseUrl}/pan/pan`,
        { id_number: pan },
        { headers: this.headers },
      );
      return res.data;
    } catch (err: any) {
      return this.normalizeError(err);
    }
  }

  async verifyGst(gst: string) {
    try {
      const res = await axios.post(
        `${this.baseUrl}/corporate/gstin`,
        { id_number: gst },
        { headers: this.headers },
      );
      return res.data;
    } catch (err: any) {
      return this.normalizeError(err);
    }
  }
}
