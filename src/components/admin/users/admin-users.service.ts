import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/components/user/user.entity';
@Injectable()
export class AdminUsersService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  listUsers() {
    return this.users.find();
  }

  async getUser(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async blockUser(id: string) {
    await this.getUser(id);
    await this.users.update(id, { isActive: false });
    return { message: 'User blocked' };
  }
}
