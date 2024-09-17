import { ApiProperty } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { OrderItem } from '../entities/order-item.entity';

export class OrderItemDTO {
  @ApiProperty({ description: 'The unique identifier for an order item' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'The quantity of the product in the order' })
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'The price of the product at the time of the order',
    type: 'number',
    format: 'decimal',
  })
  @IsDecimal()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'The product associated with this order item',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'The order associated with this order item',
  })
  @IsString()
  orderId: string;

  static fromEntity(orderItem: OrderItem): OrderItemDTO {
    return plainToClass(OrderItemDTO, orderItem, {
      excludeExtraneousValues: true,
    });
  }

  static toEntity(orderItemDTO: OrderItemDTO): OrderItem {
    const orderItem = new OrderItem();
    orderItem.id = orderItemDTO.id;
    orderItem.quantity = orderItemDTO.quantity;
    orderItem.price = orderItemDTO.price;
    orderItem.productId = orderItemDTO.productId;
    orderItem.orderId = orderItemDTO.orderId;
    return orderItem;
  }
}
