import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for a comment' })
  id: string;

  @ManyToOne(() => Product, (product) => product.comments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ description: 'The product associated with the comment' })
  product: Product;

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
