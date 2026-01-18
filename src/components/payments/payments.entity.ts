import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Booking } from '../bookings/bookings.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking)
  order: Booking;

  @Column()
  razorpayOrderId: string;

  @Column({ nullable: true })
  razorpayPaymentId: string;

  @Column()
  amount: number;

  @Column({ default: 'CREATED' })
  status: 'CREATED' | 'PAID' | 'FAILED';

  @CreateDateColumn()
  createdAt: Date;
}
