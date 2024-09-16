import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for a cart item' })
  id: string;

  @Column('uuid')
  @ApiProperty({ description: 'The cart that owns this cart item' })
  cartId: string;

  @ManyToOne(() => Product, (product) => product.cartItems, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ description: 'The product associated with this cart item' })
  product: Product;

  @Column('int')
  @ApiProperty({ description: 'The quantity of the product in the cart' })
  quantity: number;
}
