import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { UserDTO } from 'src/users/dtos';
import { User } from 'src/users/entities';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enum';
import { OrderItemDTO } from './order-item.dto';

export class OrderDTO {
  @ApiProperty({ description: 'Unique identifier for the order' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Status of the order', enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiProperty({ description: 'The user who placed the order' })
  @Type(() => UserDTO)
  user: UserDTO;

  @ApiProperty({
    description: 'List of order items',
    type: () => [OrderItemDTO],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDTO)
  orderItems: OrderItemDTO[];

  static fromEntity(order: Order): OrderDTO {
    if (!order) {
      return null;
    }
    const orderDTO = new OrderDTO();
    orderDTO.id = order.id;
    orderDTO.status = order.status;
    if (order.user) {
      orderDTO.user = new UserDTO();
      orderDTO.user.id = order.user.id;
    }
    if (!order.orderItems && order.orderItems.length > 0) {
      orderDTO.orderItems = order.orderItems.map(OrderItemDTO.fromEntity);
    }
    return orderDTO;
  }

  static toEntity(dto: OrderDTO): Order {
    if (!dto) {
      return null;
    }
    const order = new Order();
    order.id = dto.id;
    order.status = dto.status;
    if (dto.user) {
      order.user = new User();
      order.user.id = dto.user.id;
    }
    if (!dto.orderItems && dto.orderItems.length > 0) {
      order.orderItems = dto.orderItems.map(OrderItemDTO.toEntity);
    }
    return order;
  }
}
