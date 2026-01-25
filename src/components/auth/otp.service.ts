// src/components/auth/otp.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { OtpStore } from './otp.store';

@Injectable()
export class OtpService {
  constructor(private readonly otpStore: OtpStore) {}

  async sendOtp(phone: string) {
    const otp = this.generateOtp();
    // console.log('checkotp', otp);
    // Save OTP (5 mins expiry)
    this.otpStore.save(phone, otp, 5 * 60);

    const payload = {
      template_id: process.env.MSG91_TEMPLATE_ID,
      sender: process.env.MSG91_SENDER_ID,
      short_url: 0,
      mobiles: `91${phone}`,
      variables: {
        VAR1: otp,
      },
    };
    console.log('checkpayload', payload);
    try {
      console.log(JSON.stringify(payload, null, 2));
      await axios.post('https://control.msg91.com/api/v5/flow/', payload, {
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          'Content-Type': 'application/json',
        },
      });

      return { message: 'OTP sent successfully' };
    } catch (err) {
      console.error('MSG91 ERROR:', err.response?.data || err.message);
      throw new BadRequestException('Failed to send OTP');
    }
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const storedOtp = this.otpStore.get(phone);

    if (!storedOtp) return false;
    if (storedOtp !== otp) return false;

    // Consume OTP
    this.otpStore.remove(phone);
    return true;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
