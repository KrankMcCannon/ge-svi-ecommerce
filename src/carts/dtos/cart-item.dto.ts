import { ApiProperty } from '@nestjs/swagger';
import { plainToClass, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';
import { ProductDTO } from 'src/products/dtos';
import { CartItem } from '../entities/cartItem.entity';
import { CartDTO } from './cart.dto';

export class CartItemDTO {
  @ApiProperty({ description: 'The unique identifier for a cart item' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'The cart associated with this cart item',
    type: CartDTO,
  })
  @Type(() => CartDTO)
  cart: CartDTO;

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

  @ApiProperty({ description: 'The price of the product in the cart' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  static fromEntity(cartItem: CartItem): CartItemDTO {
    return plainToClass(CartItemDTO, cartItem);
  }

  static toEntity(cartItemDTO: CartItemDTO): CartItem {
    const cartItem = new CartItem();
    cartItem.id = cartItemDTO.id;
    cartItem.cart = CartDTO.toEntity(cartItemDTO.cart);
    cartItem.product = ProductDTO.toEntity(cartItemDTO.product);
    cartItem.quantity = cartItemDTO.quantity;
    cartItem.price = cartItemDTO.price;
    return cartItem;
  }
}
