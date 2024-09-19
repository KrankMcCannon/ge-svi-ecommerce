import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for a cart item' })
  id: string;

  @ApiProperty({ description: 'The cart that owns this cart item' })
  @ManyToOne(() => Cart, (cart) => cart.cartItems, { onDelete: 'CASCADE' })
  @JoinColumn()
  cart: Cart;

  @ApiProperty({ description: 'The product associated with this cart item' })
  @ManyToOne(() => Product, (product) => product.cartItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product: Product;

  @Column('int')
  @ApiProperty({
    description: 'The quantity of the product in the cart',
    minimum: 1,
    type: 'number',
  })
  quantity: number;

  @Column('float')
  @ApiProperty({
    description: 'The price of the product in the cart',
    minimum: 1,
    type: 'number',
  })
  price: number;
}
