import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for a comment' })
  id: string;

  @Column('uuid')
  @ApiProperty({ description: 'The product associated with the comment' })
  productId: string;

  @Column('text')
  @ApiProperty({ description: 'The content of the comment' })
  content: string;

  @Column()
  @ApiProperty({ description: 'The author of the comment' })
  author: string;

  @CreateDateColumn()
  @ApiProperty({
    description: 'The date the comment was created',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'The date the comment was last updated',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
