// src/components/social/social-like.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../user/user.entity';
import { SocialPost } from './social-post.entity';

@Entity('social_likes')
@Unique(['userId', 'postId'])
export class SocialLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  postId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => SocialPost, { onDelete: 'CASCADE' })
  post: SocialPost;

  @CreateDateColumn()
  createdAt: Date;
}
