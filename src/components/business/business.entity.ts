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

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Optional identifying info
  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

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

    @Column('decimal', { precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  longitude: number;
}
