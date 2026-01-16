// src/components/auth/otp.store.ts
import { Injectable } from '@nestjs/common';

type OtpEntry = {
  otp: string;
  expiresAt: number;
};

@Injectable()
export class OtpStore {
  private store = new Map<string, OtpEntry>();

  save(phone: string, otp: string, ttlSeconds: number) {
    this.store.set(phone, {
      otp,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get(phone: string): string | null {
    const entry = this.store.get(phone);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(phone);
      return null;
    }
    return entry.otp;
  }

  remove(phone: string) {
    this.store.delete(phone);
  }
}
