import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Business } from '../business/business.entity';
import { BusinessServiceEntity } from '../business-services/business-service.entity';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type BookingStatus =
  | 'created'
  | 'quotation_requested'
  | 'quotation_provided'
  | 'confirmed'
  | 'reschedule_requested'
  | 'in_service'
  | 'completed'
  | 'cancelled';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Relations */
  @ManyToOne(() => User, (u) => u.bookings, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => Business, (b) => b.bookings, { eager: true })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column('uuid')
  businessId: string;

  @ManyToOne(() => BusinessServiceEntity, (s) => s.bookings, { eager: true })
  @JoinColumn({ name: 'serviceId' })
  service: BusinessServiceEntity;

  @Column('uuid')
  serviceId: string;

  /** Booking details */
  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt: Date | null;

  /** Prices */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: string | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minPrice: string | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxPrice: string | null;

  @Column({ type: 'varchar', default: 'created' })
  status: BookingStatus;

  @Column({ type: 'varchar', default: 'pending' })
  paymentStatus: PaymentStatus;

  /** Razorpay fields */
  @Column({ nullable: true })
  razorpayOrderId?: string;

  @Column({ nullable: true })
  razorpayPaymentId?: string;

  @Column({ nullable: true })
  razorpaySignature?: string;

  /** Service lifecycle fields */
  @Column({ nullable: true })
  preServiceImageUrl?: string;

  @Column({ nullable: true })
  completionImageUrl?: string;

  @Column({ type: 'timestamptz', nullable: true })
  settlementDueDate?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
