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

  @Column({ nullable: true })
  aadhaarCard?: string;

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
  planId?: string;

  @Column({ nullable: true })
  planAmount?: number;

  @Column({ nullable: true })
  planOrderId?: string;

  @Column({ nullable: true })
  planPaymentId?: string;

  @Column({ nullable: true })
  planStatus?: 'PENDING' | 'ACTIVE';

  @Column({ type: 'timestamp', nullable: true })
  planActivatedAt?: Date;

  @Column({ nullable: true })
  kycRejectReason?: string;

  @Column({ nullable: true })
  termsSignatureName?: string;

  @Column({ type: 'timestamp', nullable: true })
  termsAcceptedAt?: Date;

  // ⚙️ Business settings (optional)
  @Column({ type: 'text', array: true, nullable: true })
  workingDays?: string[];

  @Column({ nullable: true })
  acceptingOrders?: boolean;

  @Column({ nullable: true })
  morningStart?: string;

  @Column({ nullable: true })
  morningEnd?: string;

  @Column({ nullable: true })
  eveningStart?: string;

  @Column({ nullable: true })
  eveningEnd?: string;

  @Column({ type: 'jsonb', nullable: true })
  breaks?: { start: string; end: string }[];

  @Column({ type: 'text', array: true, nullable: true })
  holidays?: string[];

  @Column({ nullable: true })
  maxBookingsPerDay?: number;

  @Column({ nullable: true })
  radius?: number;

  @Column({ type: 'jsonb', nullable: true })
  location?: { lat: number; lng: number };

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

  @OneToMany(() => SocialPost, () => undefined)
  socialPosts: SocialPost[];

  @OneToMany(() => Booking, (b) => b.business)
  bookings: Booking[];
}
