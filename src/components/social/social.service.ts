import { ForbiddenException, Injectable } from '@nestjs/common';
import { S3Service } from '../aws/s3.service';
import { Repository } from 'typeorm';
import { SocialComment } from './social-comment.entity';
import { SocialLike } from './social-like.entity';
import { SocialPost } from './social-post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from '../business/business.entity';

// src/components/social/social.service.ts
@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(SocialPost)
    private readonly repo: Repository<SocialPost>,

    @InjectRepository(SocialLike)
    private readonly likeRepo: Repository<SocialLike>,

    @InjectRepository(SocialComment)
    private readonly commentRepo: Repository<SocialComment>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,

    private readonly s3Service: S3Service,
  ) {}

  // ---------------- OWNER FEED ----------------
  async getForOwner(ownerId: string, page = 1, limit = 6) {
    const business = await this.businessRepo.findOne({
      where: { owner: { id: ownerId } },
    });

    if (!business) throw new ForbiddenException('No business found');

    return this.getForBusiness(business.id, page, limit);
  }

  // ---------------- UPLOAD ----------------
  async upload(ownerId: string, file: Express.Multer.File, caption?: string) {
    const business = await this.businessRepo.findOne({
      where: { owner: { id: ownerId } },
    });

    if (!business) throw new ForbiddenException('No business found');

    const { url } = await this.s3Service.upload(file, 'business-social');

    return this.repo.save({
      url,
      caption,
      businessId: business.id,
    });
  }

  // ---------------- PUBLIC FEED ----------------
  async getForBusiness(businessId: string, page = 1, limit = 6) {
    const skip = (page - 1) * limit;

    const posts = await this.repo.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return Promise.all(
      posts.map(async (p) => ({
        ...p,
        likesCount: await this.likeRepo.count({ where: { postId: p.id } }),
        comments: await this.commentRepo.find({
          where: { postId: p.id },
          order: { createdAt: 'ASC' },
        }),
      })),
    );
  }

  // ---------------- LIKE / UNLIKE ----------------
  async toggleLike(postId: string, userId: string) {
    const existing = await this.likeRepo.findOne({
      where: { postId, userId },
    });

    if (existing) {
      await this.likeRepo.delete(existing.id);
    } else {
      await this.likeRepo.save({ postId, userId }); // ✅ FIX
    }

    const count = await this.likeRepo.count({ where: { postId } });

    return { liked: !existing, likesCount: count };
  }

  // ---------------- COMMENT ----------------
  async addComment(postId: string, userId: string, comment: string) {
    return this.commentRepo.save({
      postId, // ✅ FIX
      userId, // ✅ FIX
      comment,
    });
  }

  async getGlobalFeed(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const posts = await this.repo.find({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return Promise.all(
      posts.map(async (p) => ({
        ...p,
        business: p.businessId,
        likesCount: await this.likeRepo.count({
          where: { postId: p.id },
        }),
        comments: await this.commentRepo.find({
          where: { postId: p.id },
          order: { createdAt: 'ASC' },
        }),
      })),
    );
  }
}
