import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { OrderItem } from '../entities/order-item.entity';
import { plainToClass, Type } from 'class-transformer';
import { ProductDTO } from 'src/products/dtos';
import { OrderDTO } from './order.dto';

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

  @ApiProperty({
    description: 'Product associated with this order item',
    type: ProductDTO,
  })
  @Type(() => ProductDTO)
  product: ProductDTO;

  @ApiProperty({
    description: 'Order associated with this order item',
    type: OrderDTO,
  })
  @Type(() => OrderDTO)
  order: OrderDTO;

  static fromEntity(orderItem: OrderItem): OrderItemDTO {
    return plainToClass(OrderItemDTO, orderItem);
  }

  static toEntity(dto: OrderItemDTO): OrderItem {
    const orderItem = new OrderItem();
    orderItem.id = dto.id;
    orderItem.quantity = dto.quantity;
    orderItem.price = dto.price;
    orderItem.product = ProductDTO.toEntity(dto.product);
    orderItem.order = OrderDTO.toEntity(dto.order);
    return orderItem;
  }
}
