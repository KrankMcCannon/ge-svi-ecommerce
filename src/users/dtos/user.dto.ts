import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Cart } from 'src/carts/entities';
import { OrderDTO } from 'src/orders/dtos/order.dto';
import { CartDTO } from '../../carts/dtos/cart.dto';
import { User } from '../entities';
import { UserWithPasswordDTO } from './user-password.dto';

export class UserDTO {
  @ApiProperty({ description: 'Unique identifier for the user' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Full name of the user' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Role of the user', default: 'guest' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: "User's active cart", type: CartDTO })
  @Type(() => CartDTO)
  cart: CartDTO;

  @ApiProperty({ description: "User's past orders", type: [OrderDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDTO)
  orders: OrderDTO[];

  static fromPasswordDTO(dto: UserWithPasswordDTO): User {
    if (!dto) {
      return null;
    }
    const user = new User();
    user.id = dto.id;
    user.name = dto.name;
    user.email = dto.email;
    user.role = dto.role;
    if (dto.cart) {
      const cart = new CartDTO();
      user.cart.id = cart.id;
    }
    if (dto.orders && dto.orders?.length > 0) {
      user.orders = dto.orders.map(OrderDTO.toEntity);
    }
    return user;
  }

  static fromEntity(user: User): UserDTO {
    if (!user) {
      return null;
    }
    const userDTO = new UserDTO();
    userDTO.id = user.id;
    userDTO.name = user.name;
    userDTO.email = user.email;
    userDTO.role = user.role;
    if (user.cart) {
      userDTO.cart = new CartDTO();
      userDTO.cart.id = user.cart.id;
    }
    if (user.orders && user.orders?.length > 0) {
      userDTO.orders = user.orders.map(OrderDTO.fromEntity);
    }
    return userDTO;
  }

  static toEntity(dto: UserDTO): User {
    if (!dto) {
      return null;
    }
    const user = new User();
    user.id = dto.id;
    user.name = dto.name;
    user.email = dto.email;
    user.role = dto.role;
    if (dto.cart) {
      user.cart = new Cart();
      user.cart.id = dto.cart.id;
    }
    if (dto.orders && dto.orders?.length > 0) {
      user.orders = dto.orders.map(OrderDTO.toEntity);
    }
    return user;
  }
}
