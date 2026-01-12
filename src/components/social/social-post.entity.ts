// src/components/social/social-post.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Business } from '../business/business.entity';

@Entity('social_posts')
export class SocialPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  caption?: string;

  @Column('uuid')
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  business: Business;

  @CreateDateColumn()
  createdAt: Date;
}
