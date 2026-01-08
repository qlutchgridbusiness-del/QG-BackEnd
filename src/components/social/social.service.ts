import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../business/business.entity';
import { SocialPost } from './social-post.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { S3Service } from '../aws/s3.service';

// src/components/social/social.service.ts
@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(SocialPost)
    private readonly repo: Repository<SocialPost>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    private readonly s3Service: S3Service,
  ) {}

  async getForOwner(ownerId: string) {
    return this.repo.find({
      where: { business: { owner: { id: ownerId } } },
      order: { createdAt: 'DESC' },
    });
  }

  async upload(ownerId: string, file: Express.Multer.File, caption?: string) {
    const business = await this.businessRepo.findOne({
      where: { owner: { id: ownerId } },
    });

    if (!business) {
      throw new ForbiddenException('No business found');
    }

    const { url } = await this.s3Service.upload(file, 'business-social');

    const post = this.repo.create({
      url,
      caption,
      business,
    });

    return this.repo.save(post);
  }
  async getForBusiness(businessId: string, page = 1, limit = 6) {
    return this.repo.find({
      where: { business: { id: businessId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['business'],
    });
  }
}
