import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Business } from '../business/business.entity';

@Entity()
export class Services {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Business, (business) => business.services, { onDelete: 'CASCADE' })
  business: Business;
}
