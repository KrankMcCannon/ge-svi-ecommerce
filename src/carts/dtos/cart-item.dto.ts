import { ApiProperty } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { CartItem } from '../entities/cartItem.entity';

export class CartItemDTO {
  @ApiProperty({ description: 'The unique identifier for a cart item' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'The cart associated with this cart item' })
  @IsUUID()
  cartId: string;

  @ApiProperty({
    description: 'The product associated with this cart item',
  })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'The quantity of the product in the cart' })
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  static fromEntity(cartItem: CartItem): CartItemDTO {
    return plainToClass(CartItemDTO, cartItem, {
      excludeExtraneousValues: true,
    });
  }

  static toEntity(cartItemDTO: CartItemDTO): CartItem {
    const cartItem = new CartItem();
    cartItem.id = cartItemDTO.id;
    cartItem.cartId = cartItemDTO.cartId;
    cartItem.productId = cartItemDTO.productId;
    cartItem.quantity = cartItemDTO.quantity;
    return cartItem;
  }
}
