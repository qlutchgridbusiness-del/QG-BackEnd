import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { S3Service } from '../aws/s3.service';
import { In, Repository } from 'typeorm';
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
  async getForOwner(userId: string) {
    const businesses = await this.businessRepo.find({
      where: { owner: { id: userId } },
    });

    const ids = businesses.map((b) => b.id);

    return this.getForBusinesses(ids);
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

  async getForBusinesses(businessIds: string[], page = 1, limit = 10) {
    const posts = await this.repo.find({
      where: { businessId: In(businessIds) },
      relations: ['business'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return Promise.all(
      posts.map(async (p) => ({
        ...p,
        likesCount: await this.likeRepo.count({ where: { postId: p.id } }),
        comments: await this.commentRepo.find({ where: { postId: p.id } }),
      })),
    );
  }

  async getForBusinessId(businessId: string, page = 1, limit = 10) {
    const posts = await this.repo.find({
      where: { businessId },
      relations: ['business'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return Promise.all(
      posts.map(async (p) => ({
        ...p,
        likesCount: await this.likeRepo.count({
          where: { postId: p.id },
        }),
        comments: await this.commentRepo.find({
          where: { postId: p.id },
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
      relations: ['business'],
      skip,
      take: limit,
    });

    return Promise.all(
      posts.map(async (p) => ({
        ...p,
        business: {
          id: p.business.id,
          name: p.business.name,
        },
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
  async replyToComment(commentId: string, ownerId: string, reply: string) {
    const parent = await this.commentRepo.findOne({
      where: { id: commentId },
    });

    if (!parent) {
      throw new NotFoundException('Comment not found');
    }

    // find post
    const post = await this.repo.findOne({
      where: { id: parent.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // ownership check
    const business = await this.businessRepo.findOne({
      where: {
        id: post.businessId,
        owner: { id: ownerId },
      },
    });

    if (!business) {
      throw new ForbiddenException('Not your business');
    }

    return this.commentRepo.save({
      comment: reply,
      postId: parent.postId,
      userId: ownerId,
      parentCommentId: parent.id,
      isBusinessReply: true,
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // allow comment owner
    if (comment.userId === userId) {
      await this.commentRepo.delete(comment.id);
      return { deleted: true };
    }

    // allow business owner
    const post = await this.repo.findOne({
      where: { id: comment.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const business = await this.businessRepo.findOne({
      where: {
        id: post.businessId,
        owner: { id: userId },
      },
    });

    if (!business) {
      throw new ForbiddenException('Not allowed');
    }

    await this.commentRepo.delete(comment.id);
    return { deleted: true };
  }

  async deletePost(postId: string, ownerId: string) {
    const post = await this.repo.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const business = await this.businessRepo.findOne({
      where: {
        id: post.businessId,
        owner: { id: ownerId },
      },
    });

    if (!business) {
      throw new ForbiddenException('Not your post');
    }

    await this.repo.delete(post.id);
    return { deleted: true };
  }
}
