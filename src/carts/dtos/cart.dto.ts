import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { UserDTO } from 'src/users/dtos';
import { Cart } from '../entities';
import { CartItemDTO } from './cart-item.dto';
import { User } from 'src/users/entities';

export class CartDTO {
  @ApiProperty({ description: 'Unique identifier for the cart' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'The user ID who owns this cart', type: UserDTO })
  @Type(() => UserDTO)
  user: UserDTO;

  @ApiProperty({ description: 'List of cart items', type: () => [CartItemDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDTO)
  cartItems: CartItemDTO[];

  static fromEntity(cart: Cart): CartDTO {
    if (!cart) {
      return null;
    }
    const cartDTO = new CartDTO();
    cartDTO.id = cart.id;
    if (cart.user) {
      cartDTO.user = new UserDTO();
      cartDTO.user.id = cart.user.id;
    }
    if (!cart.cartItems && cart.cartItems.length > 0) {
      cartDTO.cartItems = cart.cartItems.map(CartItemDTO.fromEntity);
    }
    return cartDTO;
  }

  static toEntity(dto: CartDTO): Cart {
    if (!dto) {
      return null;
    }
    const cart = new Cart();
    cart.id = dto.id;
    if (dto.user) {
      cart.user = new User();
      cart.user.id = dto.user.id;
    }
    if (!dto.cartItems && dto.cartItems.length > 0) {
      cart.cartItems = dto.cartItems.map(CartItemDTO.toEntity);
    }
    return cart;
  }
}
