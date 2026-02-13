import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const phone = process.env.ADMIN_PHONE;
    if (!phone) {
      Logger.warn('ADMIN_PHONE not set. Admin seed skipped.');
      return;
    }

    const name = process.env.ADMIN_NAME || 'Admin';
    const email = process.env.ADMIN_EMAIL || null;

    let user = await this.userRepo.findOne({ where: { phone } });

    if (!user && email) {
      user = await this.userRepo.findOne({ where: { email } });
    }

    if (user) {
      user.role = UserRole.ADMIN;
      user.name = name || user.name;
      user.phone = phone || user.phone;

      if (email) {
        const emailOwner = await this.userRepo.findOne({ where: { email } });
        if (!emailOwner || emailOwner.id === user.id) {
          user.email = email;
        } else {
          Logger.warn('ADMIN_EMAIL already in use. Skipping email update.');
        }
      }

      await this.userRepo.save(user);
      Logger.log(`Admin user ensured for phone ${phone}`);
      return;
    }

    const created = this.userRepo.create({
      phone,
      name,
      email: email || undefined,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await this.userRepo.save(created);
    Logger.log(`Admin user created for phone ${phone}`);
  }
}
