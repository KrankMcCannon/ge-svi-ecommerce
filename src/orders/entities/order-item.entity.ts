import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the order item' })
  id: string;

  @Column('uuid')
  @ApiProperty({ description: 'Product associated with this order item' })
  productId: string;

  @Column('int')
  @ApiProperty({ description: 'Quantity of the product in the order' })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({
    description: 'Price of the product at the time of the order',
    type: 'number',
    format: 'decimal',
  })
  price: number;

  @Column('uuid')
  orderId: string;
}
