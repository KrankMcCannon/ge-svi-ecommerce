import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { ProductDTO } from '../../products/dtos/product.dto';
import { CartItem } from '../entities/cartItem.entity';
import { plainToClass, Type } from 'class-transformer';

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
    type: ProductDTO,
  })
  @Type(() => ProductDTO)
  product: ProductDTO;

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
    cartItem.product = ProductDTO.toEntity(cartItemDTO.product);
    cartItem.quantity = cartItemDTO.quantity;
    return cartItem;
  }
}
