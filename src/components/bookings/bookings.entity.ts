import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Business } from '../business/business.entity';
import { BusinessServiceEntity } from '../business-services/business-service.entity';

export enum BookingStatus {
  REQUESTED = 'REQUESTED', // user placed booking
  ACCEPTED = 'ACCEPTED', // business accepted
  REJECTED = 'REJECTED', // business rejected
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED', // user or business cancelled
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Business)
  business: Business;

  @ManyToOne(() => BusinessServiceEntity)
  service: BusinessServiceEntity;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date | null;

  // 🔐 price snapshot at booking time
  @Column({ type: 'decimal', nullable: true })
  priceSnapshot?: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.REQUESTED,
  })
  status: BookingStatus;

  @Column({ nullable: true })
  cancelReason?: string;

  @CreateDateColumn()
  createdAt: Date;
}
