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

  // user who commented OR business owner replying
  @Column('uuid')
  userId: string;

  // post on which comment is made
  @Column('uuid')
  postId: string;

  @Column({ type: 'uuid', nullable: true })
  parentCommentId?: string;

  @Column({ default: false })
  isBusinessReply: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
