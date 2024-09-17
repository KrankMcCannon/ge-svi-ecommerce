import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for an order item' })
  id: string;

  @Column('uuid')
  @ApiProperty({ description: 'The order that owns this order item' })
  orderId: string;

  @Column('uuid')
  @ApiProperty({ description: 'The product associated with this order item' })
  productId: string;

  @Column('int8')
  @ApiProperty({ description: 'The quantity of the product in the order' })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({
    description: 'The price of the product at the time of the order',
    type: 'number',
    format: 'decimal',
  })
  price: number;
}
