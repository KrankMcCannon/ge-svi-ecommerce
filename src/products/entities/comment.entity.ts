import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier for a comment' })
  id: number;

  @ManyToOne(() => Product, { eager: true })
  @ApiProperty({ description: 'The product associated with the comment' })
  product: Product;

  @Column('text')
  @ApiProperty({ description: 'The content of the comment' })
  content: string;

  @Column()
  @ApiProperty({ description: 'The author of the comment' })
  author: string;
}
