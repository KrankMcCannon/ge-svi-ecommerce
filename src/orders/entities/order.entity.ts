import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the order' })
  id: string;

  @Column('uuid')
  @ApiProperty({ description: 'User who placed the order' })
  userId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @ApiProperty({ description: 'Status of the order', enum: OrderStatus })
  status: OrderStatus;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.orderId, {
    cascade: true,
    eager: true,
  })
  @ApiProperty({ description: 'List of order items' })
  orderItems: OrderItem[];

  @CreateDateColumn()
  @ApiProperty({ description: 'Date the order was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Date the order was last updated' })
  updatedAt: Date;
}
