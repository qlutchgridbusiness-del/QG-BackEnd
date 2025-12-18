import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Business } from '../business/business.entity';

@Entity('business_kyc')
export class BusinessKyc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Business, { eager: true })
  @JoinColumn()
  business: Business;

  @Column({ nullable: true })
  panNumber?: string;

  @Column({ default: false })
  panVerified: boolean;

  @Column({ nullable: true })
  gstNumber?: string;

  @Column({ default: false })
  gstVerified: boolean;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  })
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column('jsonb', { nullable: true })
  panResponse?: any;

  @Column('jsonb', { nullable: true })
  gstResponse?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
