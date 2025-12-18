import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { BusinessServiceEntity } from '../business-services/business-service.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => BusinessServiceEntity, { eager: true })
  service: BusinessServiceEntity;

  @CreateDateColumn()
  createdAt: Date;
}
