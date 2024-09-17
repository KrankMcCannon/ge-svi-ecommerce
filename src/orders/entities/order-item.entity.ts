import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the order item' })
  id: string;

  @ApiProperty({
    description: 'Order associated with this order item',
    type: Order,
  })
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiProperty({
    description: 'Product associated with this order item',
    type: Product,
  })
  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'productId' })
  product: Product;

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
}
