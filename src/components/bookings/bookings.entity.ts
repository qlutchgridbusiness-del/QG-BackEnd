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
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
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

  @ManyToOne(() => BusinessServiceEntity)
  service: BusinessServiceEntity;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date | null;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CREATED,
  })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;
}
