import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from '../cart/cart.entity';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/bookings.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  async add({ userId, serviceId, businessId, qty = 1, price }: any) {
    const item = this.cartRepo.create({
      userId,
      serviceId,
      businessId,
      qty,
      price,
    });
    return this.cartRepo.save(item);
  }

  async remove({ userId, serviceId }: any) {
    return this.cartRepo.delete({ userId, serviceId });
  }

  async list(userId: string) {
    return this.cartRepo.find({ where: { userId } });
  }

  async checkout({ userId, items, scheduledAt }: any) {
    const created: Booking[] = [];
    for (const it of items) {
      const b = this.bookingRepo.create({
        userId,
        businessId: it.businessId,
        serviceId: it.serviceId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'created',
        paymentStatus: 'pending',
      });
      const saved = await this.bookingRepo.save(b);
      created.push(saved);
    }
    await this.cartRepo.delete({ userId });
    return created;
  }
}
