import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for a cart item' })
  id: number;

  @ManyToOne(() => Product, { eager: true })
  @ApiProperty({ description: 'The product associated with the cart item' })
  product: Product;

  @Column()
  @ApiProperty({ description: 'The quantity of the product in the cart' })
  quantity: number;
}
