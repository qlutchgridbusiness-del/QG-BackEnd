// src/components/social/social-like.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('social_likes')
@Unique(['userId', 'postId'])
export class SocialLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  postId: string;

  @CreateDateColumn()
  createdAt: Date;
}
