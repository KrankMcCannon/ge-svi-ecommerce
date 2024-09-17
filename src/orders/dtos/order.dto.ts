import { ApiProperty } from '@nestjs/swagger';
import { plainToClass, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enum';
import { OrderItemDTO } from './order-item.dto';

export class OrderDTO {
  @ApiProperty({ description: 'Unique identifier for the order' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'The user who placed the order' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Status of the order', enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiProperty({
    description: 'List of order items',
    type: () => [OrderItemDTO],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDTO)
  orderItems: OrderItemDTO[];

  static fromEntity(order: Order): OrderDTO {
    return plainToClass(OrderDTO, order, {
      excludeExtraneousValues: true,
    });
  }

  static toEntity(dto: OrderDTO): Order {
    const order = new Order();
    order.id = dto.id;
    order.userId = dto.userId;
    order.status = dto.status;
    order.orderItems = dto.orderItems.map(OrderItemDTO.toEntity);
    return order;
  }
}
