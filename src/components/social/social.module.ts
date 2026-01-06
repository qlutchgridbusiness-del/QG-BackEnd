// src/components/social/social.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialPost } from './social-post.entity';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { Business } from '../business/business.entity';
import { S3Service } from '../aws/s3.service';
import { SocialComment } from './social-comment.entity';
import { SocialLike } from './social-like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SocialPost, Business, SocialComment, SocialLike]),
  ],
  controllers: [SocialController],
  providers: [SocialService, S3Service],
})
export class SocialModule {}
