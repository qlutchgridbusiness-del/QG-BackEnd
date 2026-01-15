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

  @Column({
    name: 'parent_comment_id',
    type: 'uuid',
    nullable: true,
  })
  parentCommentId?: string;

  @Column({
    name: 'is_business_reply',
    type: 'boolean',
    default: false,
  })
  isBusinessReply: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
