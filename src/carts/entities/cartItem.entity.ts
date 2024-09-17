import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for a cart item' })
  id: string;

  @Column('uuid')
  @ApiProperty({ description: 'The cart that owns this cart item' })
  cartId: string;

  @Column('uuid')
  @ApiProperty({ description: 'The product associated with this cart item' })
  productId: string;

  @Column('int')
  @ApiProperty({ description: 'The quantity of the product in the cart' })
  quantity: number;
}
