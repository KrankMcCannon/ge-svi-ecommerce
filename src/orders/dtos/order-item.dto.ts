import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { OrderItem } from '../entities/order-item.entity';

export class OrderItemDTO {
  @ApiProperty({ description: 'Unique identifier for the order item' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Quantity of the product in the order' })
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Price of the product at the time of the order',
    type: 'number',
    format: 'decimal',
  })
  @IsDecimal()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Product associated with this order item' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Order associated with this order item' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  static fromEntity(orderItem: OrderItem): OrderItemDTO {
    const dto = new OrderItemDTO();
    dto.id = orderItem.id;
    dto.quantity = orderItem.quantity;
    dto.price = orderItem.price;
    dto.productId = orderItem.productId;
    dto.orderId = orderItem.orderId;
    return dto;
  }

  static toEntity(dto: OrderItemDTO): OrderItem {
    const orderItem = new OrderItem();
    orderItem.id = dto.id;
    orderItem.quantity = dto.quantity;
    orderItem.price = dto.price;
    orderItem.productId = dto.productId;
    orderItem.orderId = dto.orderId;
    return orderItem;
  }
}
