import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from '../../carts/entities/cart.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('users')
export class User {
  @ApiProperty({ description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Full name of the user' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Email address of the user' })
  @Unique(['email'])
  @Column({ length: 255, unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @ApiProperty({ description: 'Role of the user', default: 'guest' })
  @Column({ default: 'guest' })
  role: string;

  @OneToOne(() => Cart, (cart) => cart.user, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  @ApiProperty({ description: "User's active cart" })
  cart: Cart;

  @OneToMany(() => Order, (order) => order.user)
  @ApiProperty({ description: "User's past orders" })
  orders: Order[];

  @ApiProperty({
    description: 'The date the user was created',
    type: 'string',
    format: 'date-time',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'The date the user was last updated',
    type: 'string',
    format: 'date-time',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
