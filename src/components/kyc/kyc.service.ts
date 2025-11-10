import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KycService {
  private readonly baseUrl = 'https://sandbox-api.eko.in'; // Eko sandbox
  private readonly apiKey = 'YOUR_EKO_API_KEY'; // Replace with your API key

  // 1️⃣ Request OTP for Aadhaar
  async requestAadhaarOtp(aadhaarNumber: string): Promise<{ txnId: string }> {
    const response = await axios.post(
      `${this.baseUrl}/aadhaar/otp/request`,
      { aadhaar: aadhaarNumber },
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );

    return { txnId: response.data.txnId };
  }

  // 2️⃣ Verify OTP
  async verifyAadhaarOtp(aadhaarNumber: string, txnId: string, otp: string): Promise<boolean> {
    const response = await axios.post(
      `${this.baseUrl}/aadhaar/otp/verify`,
      { aadhaar: aadhaarNumber, txnId, otp },
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );

    // Eko returns success flag
    return response.data.verified;
  }

  // 3️⃣ Optional: PAN verification
  async verifyPan(panNumber: string): Promise<boolean> {
    const response = await axios.post(
      `${this.baseUrl}/pan/verify`,
      { pan: panNumber },
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );

    return response.data.verified;
  }
}
