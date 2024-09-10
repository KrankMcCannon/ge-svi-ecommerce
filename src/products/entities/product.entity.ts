import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for a product' })
  id: number;

  @Column({ length: 255 })
  @ApiProperty({ description: 'The name of the product', maxLength: 255 })
  name: string;

  @Column('text')
  @ApiProperty({ description: 'The description of the product' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({
    description: 'The price of the product',
    type: 'number',
    format: 'decimal',
  })
  price: number;

  @Column({ default: 0 })
  @ApiProperty({ description: 'The stock quantity of the product', default: 0 })
  stock: number;

  @CreateDateColumn()
  @ApiProperty({
    description: 'The date the product was created',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'The date the product was last updated',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
