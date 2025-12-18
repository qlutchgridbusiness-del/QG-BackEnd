// src/components/business/business.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './business.entity';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { User } from '../user/user.entity';
import { SocialPostEntity } from '../business-services/social-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business, User, SocialPostEntity])],
  providers: [BusinessService],
  controllers: [BusinessController],
  exports: [TypeOrmModule],
})
export class BusinessModule {}
