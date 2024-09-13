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

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for a cart item' })
  id: string;

  @ManyToOne(() => Product, (product) => product.cartItems, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ description: 'The product associated with the cart item' })
  product: Product;

  @Column()
  @ApiProperty({ description: 'The quantity of the product in the cart' })
  quantity: number;

  @CreateDateColumn()
  @ApiProperty({
    description: 'The date the cart item was created',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'The date the cart item was last updated',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
