import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Business } from '../business/business.entity';

@Entity('social_posts')
export class SocialPostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  url: string; // CDN/S3/Cloudinary file link

  @Column({ nullable: true })
  type: string; // "image" | "video"

  @Column({ nullable: true })
  caption: string;

  @ManyToOne(() => Business, (business) => business.socialPosts, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  business?: Business;

  @CreateDateColumn()
  createdAt: Date;
}
