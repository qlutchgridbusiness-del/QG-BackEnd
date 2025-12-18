import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartItem } from './cart.entity';
import { Booking, BookingStatus } from '../bookings/bookings.entity';
import { BusinessServiceEntity } from '../business-services/business-service.entity';
import { User } from '../user/user.entity';
import { BusinessStatus } from '../business/business-status.enum';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,

    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    @InjectRepository(BusinessServiceEntity)
    private readonly serviceRepo: Repository<BusinessServiceEntity>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /* ---------------- ADD TO CART ---------------- */
  async addToCart(userId: string, serviceId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const service = await this.serviceRepo.findOne({
      where: { id: serviceId },
      relations: ['business'],
    });
    if (!service) throw new NotFoundException('Service not found');

    if (service.business.status !== BusinessStatus.ACTIVE) {
      throw new ForbiddenException('This business is not verified yet');
    }

    const existing = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        service: { id: serviceId },
      },
    });
    if (existing) return existing;

    const cartItem = this.cartRepo.create({
      user,
      service,
    });

    return this.cartRepo.save(cartItem);
  }

  /* ---------------- REMOVE FROM CART ---------------- */
  async removeFromCart(userId: string, cartItemId: string) {
    const result = await this.cartRepo.delete({
      id: cartItemId,
      user: { id: userId },
    });

    if (!result.affected) {
      throw new NotFoundException('Cart item not found');
    }

    return { message: 'Removed from cart' };
  }

  /* ---------------- LIST CART ---------------- */
  async listCart(userId: string) {
    return this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['service', 'service.business'],
    });
  }

  /* ---------------- CHECKOUT ---------------- */
  async checkout(userId: string, scheduledAt?: string) {
    const cartItems = await this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['user', 'service', 'service.business'],
    });

    if (!cartItems.length) {
      throw new BadRequestException('Cart is empty');
    }

    const bookings: Booking[] = [];

    for (const item of cartItems) {
      const booking = this.bookingRepo.create({
        user: item.user,
        business: item.service.business,
        service: item.service,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: BookingStatus.CREATED,
      });

      const saved = await this.bookingRepo.save(booking);
      bookings.push(saved);
    }

    await this.cartRepo.delete({ user: { id: userId } });

    return bookings;
  }
}
