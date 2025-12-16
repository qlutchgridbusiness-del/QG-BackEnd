// src/components/business/business.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { BusinessServiceEntity } from '../business-services/business-service.entity';
import { Booking } from '../bookings/bookings.entity';
import { SocialPostEntity } from '../business-services/social-post.entity';

// src/components/business/business.entity.ts
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

  /* 🔹 NEW FIELDS */

  @Column('text', { array: true, nullable: true })
  category?: string[];

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  pancard?: string;

  @Column({ nullable: true })
  aadhaarCard?: string;

  // src/components/business/business.entity.ts

  @Column({ default: false })
  panVerified: boolean;

  @Column({ default: false })
  gstVerified: boolean;

  @Column({ default: false })
  aadhaarVerified: boolean;

  @Column({ nullable: true })
  aadhaarLast4?: string;

  @Column({ nullable: true })
  verifiedName?: string;

  @Column({ nullable: true })
  gst?: string;

  @Column({ type: 'jsonb', nullable: true })
  openingHours?: Record<string, any>;

  @Column({ nullable: true })
  logoKey?: string;

  @Column({ nullable: true })
  coverKey?: string;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  latitude?: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  longitude?: number;

  /* 🔹 RELATIONS */

  @ManyToOne(() => User, (u) => u.businesses, { eager: true })
  owner: User;

  @OneToMany(() => BusinessServiceEntity, (s) => s.business)
  services: BusinessServiceEntity[];

  @OneToMany(() => SocialPostEntity, (post) => post.business)
  socialPosts: SocialPostEntity[];

  @OneToMany(() => Booking, (b) => b.business)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
