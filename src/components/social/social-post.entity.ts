// src/components/social/social-post.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Business } from '../business/business.entity';
import { SocialLike } from './social-like.entity';
import { SocialComment } from './social-comment.entity';

@Entity('social_posts')
export class SocialPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  caption?: string;

  @ManyToOne(() => Business, (b) => b.socialPosts, {
    onDelete: 'CASCADE',
  })
  business: Business;

  @OneToMany(() => SocialLike, (l) => l.post)
  likes: SocialLike[];

  @OneToMany(() => SocialComment, (c) => c.post)
  comments: SocialComment[];

  @CreateDateColumn()
  createdAt: Date;
}
