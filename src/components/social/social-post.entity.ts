// src/components/social/social-post.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Business } from '../business/business.entity';

@Entity('social_posts')
export class SocialPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  business: Business;

  @Column()
  url: string;

  @Column({ nullable: true })
  caption?: string;

  @CreateDateColumn()
  createdAt: Date;
}
