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
    const name = process.env.ADMIN_NAME || 'Admin';
    const email = process.env.ADMIN_EMAIL || null;
    const phone = process.env.ADMIN_PHONE || null;

    if (!email && !phone) {
      Logger.warn('ADMIN_EMAIL or ADMIN_PHONE not set. Admin seed skipped.');
      return;
    }

    let user: User | null = null;
    if (email) {
      user = await this.userRepo.findOne({ where: { email } });
    }
    if (!user && phone) {
      user = await this.userRepo.findOne({ where: { phone } });
    }

    if (user) {
      if (user.role !== UserRole.ADMIN) {
        Logger.warn(
          'Admin seed skipped: existing user found for admin email/phone. Use a unique admin email/phone.',
        );
        return;
      }
      user.name = name || user.name;
      user.phone = phone || user.phone;
      await this.userRepo.save(user);
      Logger.log(`Admin user ensured for ${email || phone}`);
      return;
    }

    const created = this.userRepo.create({
      phone: phone || null,
      name,
      email: email || undefined,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await this.userRepo.save(created);
    Logger.log(`Admin user created for ${email || phone}`);
  }
}
