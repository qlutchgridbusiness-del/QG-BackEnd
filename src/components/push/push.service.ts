import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { PushSubscription } from './push-subscription.entity';

@Injectable()
export class PushService {
  private vapidInitialized = false;

  constructor(
    @InjectRepository(PushSubscription)
    private readonly pushRepo: Repository<PushSubscription>,
  ) {}

  private initVapid() {
    if (this.vapidInitialized) return;

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || 'mailto:support@qlutchgrid.com';

    if (!publicKey || !privateKey) {
      Logger.warn('VAPID keys not configured. Push notifications disabled.');
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    this.vapidInitialized = true;
  }

  async upsertSubscription(userId: string, sub: any) {
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return;
    }

    const existing = await this.pushRepo.findOne({
      where: { endpoint: sub.endpoint },
      relations: ['user'],
    });

    if (existing) {
      existing.p256dh = sub.keys.p256dh;
      existing.auth = sub.keys.auth;
      existing.user = { id: userId } as any;
      await this.pushRepo.save(existing);
      return existing;
    }

    const created = this.pushRepo.create({
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      user: { id: userId } as any,
    });
    return this.pushRepo.save(created);
  }

  async notifyUser(userId: string, payload: any) {
    this.initVapid();

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) return;

    const subs = await this.pushRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: s.endpoint,
              keys: { p256dh: s.p256dh, auth: s.auth },
            },
            JSON.stringify(payload),
          );
        } catch (err: any) {
          // Remove expired subscriptions
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await this.pushRepo.delete({ endpoint: s.endpoint });
          }
          Logger.error('Push send failed', err?.message || err);
        }
      }),
    );
  }
}
