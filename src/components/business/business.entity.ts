import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { BusinessStatus } from './business-status.enum';
import { SocialPost } from '../social/social-post.entity';
import { BusinessServiceEntity } from '../social/business-service.entity';
import { Booking } from '../bookings/bookings.entity';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  // 🔐 KYC
  @Column({ nullable: true })
  pancard?: string;

  @Column({ nullable: true })
  gst?: string;

  @Column({ default: false })
  panVerified: boolean;

  @Column({ default: false })
  gstVerified: boolean;

  @Column({
    type: 'enum',
    enum: BusinessStatus,
    default: BusinessStatus.DRAFT,
  })
  status: BusinessStatus;

  @Column({ nullable: true })
  kycRejectReason?: string;

  @ManyToOne(() => User, (u) => u.businesses, { eager: true })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  longitude: number;

  @OneToMany(() => BusinessServiceEntity, (s) => s.business)
  services: BusinessServiceEntity[];

  @OneToMany(() => SocialPost, (p) => p.business)
  socialPosts: SocialPost[];

  @OneToMany(() => Booking, (b) => b.business)
  bookings: Booking[];
}
