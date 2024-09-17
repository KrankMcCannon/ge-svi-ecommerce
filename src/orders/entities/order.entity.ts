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

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the order' })
  id: string;

  @Column('uuid')
  @ApiProperty({ description: 'User who placed the order' })
  userId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.orderId, {
    cascade: true,
  })
  @ApiProperty({ description: 'List of order items' })
  orderItems: OrderItem[];

  @CreateDateColumn()
  @ApiProperty({ description: 'The date the order was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The date the order was last updated' })
  updatedAt: Date;
}
