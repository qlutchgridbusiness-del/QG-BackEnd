import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Business } from '../business/business.entity';
import { Services } from '../services/services.entity';

export enum BookingStatus {
  REQUESTED = 'REQUESTED',

  BUSINESS_ACCEPTED = 'BUSINESS_ACCEPTED',
  BUSINESS_REJECTED = 'BUSINESS_REJECTED',

  SERVICE_STARTED = 'SERVICE_STARTED',
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',

  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',

  VEHICLE_DELIVERED = 'VEHICLE_DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Business)
  business: Business;

  @ManyToOne(() => Services)
  service: Services;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date | null;

  // 💰 final payable amount (after service)
  @Column({ type: 'decimal', nullable: true })
  totalAmount?: number;

  // 📸 images
  @Column({ type: 'jsonb', nullable: true })
  beforeServiceImages?: string[];

  @Column({ type: 'jsonb', nullable: true })
  afterServiceImages?: string[];

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.REQUESTED,
  })
  status: BookingStatus;

  @Column({ nullable: true })
  cancelReason?: string;

  @Column({ nullable: true })
  razorpayPaymentId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
