// src/components/kyc/kyc.service.ts
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../business/business.entity';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(Business)
    private businessRepo: Repository<Business>,
  ) {}

  private client = axios.create({
    baseURL: process.env.SUREPASS_BASE_URL,
    headers: {
      Authorization: `Bearer ${process.env.SUREPASS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  /* ================= PAN ================= */
  async verifyPan(businessId: string, panNumber: string) {
    try {
      const { data } = await this.client.post(
        '/pan/pan',
        { id_number: panNumber },
        {
          headers: {
            'X-Customer-Id': process.env.SUREPASS_CUSTOMER_ID,
          },
        },
      );

      if (!data?.success) {
        throw new Error('PAN verification failed');
      }

      await this.businessRepo.update(businessId, {
        panVerified: true,
        verifiedName: data?.data?.full_name,
      });

      return {
        verified: true,
        name: data?.data?.full_name,
      };
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }

  /* ================= GST ================= */
  async verifyGst(businessId: string, gstNumber: string) {
    try {
      const { data } = await this.client.post('/corporate/gstin', {
        id_number: gstNumber,
      });

      if (!data?.success) {
        throw new Error('GST verification failed');
      }

      await this.businessRepo.update(businessId, {
        gstVerified: true,
      });

      return {
        verified: true,
        tradeName: data?.data?.trade_name,
        status: data?.data?.status,
      };
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }

  /* ================= DIGILOCKER ================= */
  generateDigilockerUrl(businessId: string) {
    return {
      url:
        `${process.env.SUREPASS_BASE_URL}/digilocker/authorize?` +
        `redirect_uri=${process.env.DIGILOCKER_REDIRECT_URL}` +
        `&state=${businessId}`,
    };
  }

  async digilockerCallback(payload: any) {
    if (!payload?.success) {
      throw new HttpException('DigiLocker verification failed', 400);
    }

    await this.businessRepo.update(payload.state, {
      aadhaarVerified: true,
      aadhaarLast4: payload?.data?.aadhaar_last_4,
      verifiedName: payload?.data?.name,
    });

    return {
      verified: true,
      aadhaarLast4: payload?.data?.aadhaar_last_4,
      name: payload?.data?.name,
    };
  }
}
