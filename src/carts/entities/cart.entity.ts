import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from './cartItem.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the cart' })
  id: string;

  @Column('uuid')
  @ApiProperty({ description: 'The user who owns this cart' })
  userId: string;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cartId, { cascade: true })
  @ApiProperty({ description: 'List of cart items', type: [CartItem] })
  cartItems: CartItem[];

  @CreateDateColumn()
  @ApiProperty({
    description: 'The date the cart was created',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'The date the cart was last updated',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
