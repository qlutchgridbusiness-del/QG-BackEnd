// src/components/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Booking } from '../bookings/bookings.entity';
import { UpdateUserProfileDto } from './create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
  ) {}

  async getById(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserProfileDto) {
    const user = await this.getById(id);
    Object.assign(user, dto);
    return this.users.save(user);
  }

  async getMyBookings(userId: string) {
    return this.bookings.find({
      where: { user: { id: userId } },
      relations: ['business', 'service'],
      order: { createdAt: 'DESC' },
    });
  }
}
