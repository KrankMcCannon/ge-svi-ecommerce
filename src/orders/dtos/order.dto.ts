import { ApiProperty } from '@nestjs/swagger';
import { Type, plainToClass } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Order } from '../entities/order.entity';
import { OrderItemDTO } from './order-item.dto';

export class OrderDTO {
  @ApiProperty({ description: 'Unique identifier for the order' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'The user who placed the order' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'List of order items',
    type: () => [OrderItemDTO],
  })
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
    order.orderItems = dto.orderItems.map(OrderItemDTO.toEntity);
    return order;
  }
}
