import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { CartItemDTO } from './cart-item.dto';
import { Cart } from '../entities';
import { plainToClass, Type } from 'class-transformer';
import { UserDTO } from 'src/users/dtos';

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
    return plainToClass(CartDTO, cart);
  }

  static toEntity(dto: CartDTO): Cart {
    const cart = new Cart();
    cart.id = dto.id;
    cart.user = UserDTO.toEntity(dto.user);
    cart.cartItems = dto.cartItems.map(CartItemDTO.toEntity);
    return cart;
  }
}
