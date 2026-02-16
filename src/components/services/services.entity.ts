import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Business } from '../business/business.entity';
import { ServiceStatus } from '../business/business-status.enum';

export enum PricingType {
  FIXED = 'FIXED',
  RANGE = 'RANGE',
  QUOTE = 'QUOTE',
}

export enum OfferingType {
  SERVICE = 'SERVICE',
  ACCESSORY = 'ACCESSORY',
}

@Entity()
export class Services {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  /* ---------------- Pricing ---------------- */

  @Column({
    type: 'enum',
    enum: PricingType,
    default: PricingType.FIXED,
  })
  pricingType: PricingType;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
  })
  price?: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minPrice?: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxPrice?: number;

  /* ---------------- Metadata ---------------- */

  @Column({ nullable: true })
  durationMinutes?: number;

  @Column({ default: true })
  available: boolean;

  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.DRAFT,
  })
  status: ServiceStatus;

  @Column({
    type: 'enum',
    enum: OfferingType,
    default: OfferingType.SERVICE,
  })
  offeringType: OfferingType;

  /* ---------------- Relations ---------------- */

  @ManyToOne(() => Business, (business) => business.services, {
    onDelete: 'CASCADE',
  })
  business: Business;
}
