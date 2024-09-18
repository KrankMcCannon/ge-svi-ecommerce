import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDecimal, IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { ProductDTO } from 'src/products/dtos';
import { Product } from 'src/products/entities';
import { Order } from '../entities';
import { OrderItem } from '../entities/order-item.entity';
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
    if (!orderItem) {
      return null;
    }
    const orderItemDTO = new OrderItemDTO();
    orderItemDTO.id = orderItem.id;
    orderItemDTO.quantity = orderItem.quantity;
    orderItemDTO.price = orderItem.price;
    if (orderItem.product) {
      orderItemDTO.product = new ProductDTO();
      orderItemDTO.product.id = orderItem.product.id;
    }
    if (orderItem.order) {
      orderItemDTO.order = new OrderDTO();
      orderItemDTO.order.id = orderItem.order.id;
    }
    return orderItemDTO;
  }

  static toEntity(dto: OrderItemDTO): OrderItem {
    if (!dto) {
      return null;
    }
    const orderItem = new OrderItem();
    orderItem.id = dto.id;
    orderItem.quantity = dto.quantity;
    orderItem.price = dto.price;
    if (dto.product) {
      orderItem.product = new Product();
      orderItem.product.id = dto.product.id;
    }
    if (dto.order) {
      orderItem.order = new Order();
      orderItem.order.id = dto.order.id;
    }
    return orderItem;
  }
}
