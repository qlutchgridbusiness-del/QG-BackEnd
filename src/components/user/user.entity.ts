import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Booking } from '../bookings/bookings.entity';
import { Business } from '../business/business.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  // @Column()
  // password: string;

  @Column({ default: 'unknown' })
  name: string;

  @Column({ default: 'unknown' })
  phone: string;

  @Column({ default: 'user' })
  role: 'user' | 'business';

  // Business-specific fields
  @Column({ nullable: true })
  pancard?: string;

  @Column({ nullable: true })
  aadhaarCard?: string;

  @Column({ nullable: true })
  gst?: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Business, (business) => business.owner)
  businesses: Business[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
