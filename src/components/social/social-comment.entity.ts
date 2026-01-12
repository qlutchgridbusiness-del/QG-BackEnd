// src/components/social/social-comment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('social_comments')
export class SocialComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  comment: string;

  @Column('uuid')
  user: string;

  @Column('uuid')
  postId: string;

  @CreateDateColumn()
  createdAt: Date;
}
