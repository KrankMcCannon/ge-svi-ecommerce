import { ApiProperty } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
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
    return plainToClass(UserWithPasswordDTO, user);
  }

  static toEntity(dto: UserWithPasswordDTO): User {
    const user = new User();
    user.id = dto.id;
    user.name = dto.name;
    user.email = dto.email;
    user.role = dto.role;
    user.password = dto.password;
    user.cart = dto.cart ? CartDTO.toEntity(dto.cart) : null;
    user.orders = dto.orders ? dto.orders.map(OrderDTO.toEntity) : [];
    return user;
  }
}
