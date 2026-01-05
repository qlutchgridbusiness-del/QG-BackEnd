// src/components/business-services/business-service.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Business } from '../business/business.entity';
import { Booking } from '../bookings/bookings.entity';

@Entity('business_services')
export class BusinessServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // 🟢 For fixed-price services
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true, // price can be null if quotation-based
    transformer: {
      to: (value?: number): string | null =>
        value !== undefined && value !== null ? value.toString() : null,
      from: (value?: string): number | null =>
        value !== undefined && value !== null ? parseFloat(value) : null,
    },
  })
  price?: number | null;

  // 🟢 For quotation-based services (optional range)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value?: number): string | null =>
        value !== undefined && value !== null ? value.toString() : null,
      from: (value?: string): number | null =>
        value !== undefined && value !== null ? parseFloat(value) : null,
    },
  })
  minPrice?: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value?: number): string | null =>
        value !== undefined && value !== null ? value.toString() : null,
      from: (value?: string): number | null =>
        value !== undefined && value !== null ? parseFloat(value) : null,
    },
  })
  maxPrice?: number | null;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number | null;

  @Column({ default: true })
  available: boolean;

  @ManyToOne(() => Business, (business) => business.services, { eager: true })
  business: Business;

  @OneToMany(() => Booking, (b) => b.service)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
