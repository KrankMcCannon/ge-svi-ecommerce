import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from '../../carts/entities/cartItem.entity';
import { Comment } from './comment.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';

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
    minimum: 0,
    format: 'decimal',
  })
  price: number;

  @Column('int8')
  @ApiProperty({
    description: 'Stock quantity of the product',
    minimum: 1,
    format: 'number',
  })
  stock: number;

  @ApiProperty({
    description: 'The cart items associated with the product',
    type: [CartItem],
  })
  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @ApiProperty({
    description: 'The comments associated with the product',
    type: [Comment],
  })
  @OneToMany(() => Comment, (comment) => comment.product, {
    cascade: ['insert', 'update'],
  })
  comments: Comment[];

  @ApiProperty({
    description: 'The order items associated with the product',
    type: [OrderItem],
  })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product, {
    cascade: ['insert', 'update'],
  })
  orderItems: OrderItem[];

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
