import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SocialPost } from './social-post.entity';
import { User } from '../user/user.entity';

// src/components/social/social-comment.entity.ts
@Entity('social_comments')
export class SocialComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  comment: string;

  @Column('uuid')
  postId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => SocialPost, { onDelete: 'CASCADE' })
  post: SocialPost;

  @CreateDateColumn()
  createdAt: Date;
}
