import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Cart } from 'src/carts/entities';
import { OrderDTO } from 'src/orders/dtos/order.dto';
import { CartDTO } from '../../carts/dtos/cart.dto';
import { User } from '../entities';
import { UserDTO } from './user.dto';

export class UserWithPasswordDTO extends UserDTO {
  @ApiProperty({ description: 'Password of the user' })
  @IsString()
  @IsNotEmpty()
  password: string;

  static fromEntity(user: User): UserWithPasswordDTO {
    if (!user) {
      return null;
    }
    const userDTO = new UserWithPasswordDTO();
    userDTO.id = user.id;
    userDTO.name = user.name;
    userDTO.email = user.email;
    userDTO.role = user.role;
    userDTO.password = user.password;
    if (userDTO.cart) {
      userDTO.cart = new CartDTO();
      userDTO.cart.id = user.cart.id;
    }
    if (user.orders && user.orders?.length > 0) {
      userDTO.orders = user.orders.map(OrderDTO.fromEntity);
    }
    return userDTO;
  }

  static toEntity(dto: UserWithPasswordDTO): User {
    if (!dto) {
      return null;
    }
    const user = new User();
    user.id = dto.id;
    user.name = dto.name;
    user.email = dto.email;
    user.role = dto.role;
    user.password = dto.password;
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
