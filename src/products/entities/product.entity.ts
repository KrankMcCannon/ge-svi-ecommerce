import { ApiProperty } from '@nestjs/swagger';
import { CartItem } from 'src/carts/entities/cartItem.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the product' })
  id: string;

  @Column({ length: 255 })
  @ApiProperty({ description: 'Name of the product', maxLength: 255 })
  name: string;

  @Column('text')
  @ApiProperty({ description: 'Description of the product' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({
    description: 'Price of the product',
    type: 'number',
    format: 'decimal',
  })
  price: number;

  @Column({ default: 0 })
  @ApiProperty({ description: 'Stock quantity of the product', default: 0 })
  stock: number;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  @ApiProperty({
    description: 'The cart items associated with the product',
    type: () => [CartItem],
  })
  cartItems: CartItem[];

  @OneToMany(() => Comment, (comment) => comment.product, { cascade: true })
  @ApiProperty({
    description: 'The comments associated with the product',
    type: () => [Comment],
  })
  comments: Comment[];

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
