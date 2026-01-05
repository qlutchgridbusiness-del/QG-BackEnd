import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../business/business.entity';
import { SocialPost } from './social-post.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSocialPostDto } from './social.dto';

// src/components/social/social.service.ts
@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(SocialPost)
    private readonly repo: Repository<SocialPost>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}

  async getForOwner(ownerId: string) {
    return this.repo.find({
      where: { business: { owner: { id: ownerId } } },
      order: { createdAt: 'DESC' },
    });
  }

  async create(ownerId: string, dto: CreateSocialPostDto) {
    const business = await this.businessRepo.findOne({
      where: { owner: { id: ownerId } },
    });
    if (!business) throw new NotFoundException('Business not found');

    const post = this.repo.create({
      business,
      imageUrl: dto.imageUrl,
      caption: dto.caption,
    });

    return this.repo.save(post);
  }
}
