import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Booking } from './bookings.entity';

export enum BookingImageType {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
}

@Entity('booking_images')
export class BookingImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking)
  booking: Booking;

  @Column({ type: 'enum', enum: BookingImageType })
  type: BookingImageType;

  @Column()
  s3Key: string;

  @CreateDateColumn()
  createdAt: Date;
}
