import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for a cart item' })
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, { onDelete: 'CASCADE' })
  @ApiProperty({ description: 'The cart that owns this cart item' })
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ description: 'The product associated with the cart item' })
  product: Product;

  @Column('int')
  @ApiProperty({ description: 'The quantity of the product in the cart' })
  quantity: number;
}
