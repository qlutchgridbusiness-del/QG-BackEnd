// src/components/social/social-comment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { SocialPost } from './social-post.entity';

@Entity('social_comments')
export class SocialComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  comment: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => SocialPost, (p) => p.comments, {
    onDelete: 'CASCADE',
  })
  post: SocialPost;

  @CreateDateColumn()
  createdAt: Date;
}
