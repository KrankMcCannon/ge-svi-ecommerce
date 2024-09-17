import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../enum';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the order' })
  id: string;

  @ApiProperty({ description: 'User who placed the order' })
  @ManyToOne(() => User, (user) => user.orders, { eager: true })
  user: User;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @ApiProperty({ description: 'Status of the order', enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ description: 'List of order items', type: [OrderItem] })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  orderItems: OrderItem[];

  @CreateDateColumn()
  @ApiProperty({ description: 'Date the order was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Date the order was last updated' })
  updatedAt: Date;
}
