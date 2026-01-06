// src/components/social/social-like.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../user/user.entity';
import { SocialPost } from './social-post.entity';

@Entity('social_likes')
@Unique(['user', 'post'])
export class SocialLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => SocialPost, (p) => p.likes, {
    onDelete: 'CASCADE',
  })
  post: SocialPost;

  @CreateDateColumn()
  createdAt: Date;
}
