import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../business/business.entity';
import { SocialPost } from './social-post.entity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { S3Service } from '../aws/s3.service';
import { SocialLike } from './social-like.entity';
import { SocialComment } from './social-comment.entity';

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

  async getForOwner(ownerId: string) {
    return this.repo.find({
      where: { business: { owner: { id: ownerId } } },
      relations: {
        likes: true,
        comments: {
          user: true,
        },
      },
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

  async toggleLike(postId: string, userId: string) {
    const existing = await this.likeRepo.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });

    if (existing) {
      await this.likeRepo.remove(existing);

      const count = await this.likeRepo.count({
        where: { post: { id: postId } },
      });

      return { liked: false, likesCount: count };
    }

    await this.likeRepo.save(
      this.likeRepo.create({
        post: { id: postId } as any,
        user: { id: userId } as any,
      }),
    );

    const count = await this.likeRepo.count({
      where: { post: { id: postId } },
    });

    return { liked: true, likesCount: count };
  }

  /* ---------------- ADD COMMENT ---------------- */

  async addComment(postId: string, userId: string, comment: string) {
    const post = await this.repo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const newComment = this.commentRepo.create({
      comment,
      post: { id: postId } as any,
      user: { id: userId } as any,
    });

    return this.commentRepo.save(newComment);
  }
}
