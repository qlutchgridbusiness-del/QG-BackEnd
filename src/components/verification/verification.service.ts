import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class VerificationService {
  private baseUrl = process.env.SUREPASS_API_URL;
  private apiKey = process.env.SUREPASS_API_KEY;

  // Aadhaar Verification
  async verifyAadhaar(aadhaarNumber: string, otp?: string): Promise<boolean> {
    try {
      console.log("checkverifyaadhaar");
      const response = await axios.post(
        `${this.baseUrl}/aadhaar/verify`,
        { aadhaarNumber, otp },
        { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
      );
      
      return response.data.verified; // true/false
    } catch (err: any) {
      throw new BadRequestException(err.response?.data?.message || err.message);
    }
  }

  // PAN Verification
  async verifyPAN(panNumber: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/pan/verify`,
        { panNumber },
        { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
      );

      return response.data.verified; // true/false
    } catch (err: any) {
      throw new BadRequestException(err.response?.data?.message || err.message);
    }
  }
}
