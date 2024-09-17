import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from './cartItem.entity';
import { User } from 'src/users/entities';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the cart' })
  id: string;

  @ApiProperty({ description: 'The user who owns this cart' })
  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn()
  user: User;

  @ApiProperty({ description: 'List of cart items', type: [CartItem] })
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    cascade: ['insert', 'update'],
    eager: true,
  })
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
