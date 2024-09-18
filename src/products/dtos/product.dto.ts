import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CartItemDTO } from 'src/carts/dtos';
import { OrderItemDTO } from 'src/orders/dtos';
import { Product } from '../entities';
import { CommentDTO } from './comment.dto';

export class ProductDTO {
  @ApiProperty({ description: 'Unique identifier for the product' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the product' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Price of the product' })
  @IsPositive()
  @IsDecimal()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Stock quantity of the product' })
  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  stock: number;

  @ApiProperty({
    description: 'The cart items associated with the product',
    type: [CartItemDTO],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDTO)
  cartItems: CartItemDTO[];

  @ApiProperty({
    description: 'The comments associated with the product',
    type: [CommentDTO],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentDTO)
  comments: CommentDTO[];

  @ApiProperty({
    description: 'The order items associated with the product',
    type: [OrderItemDTO],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDTO)
  orderItems: OrderItemDTO[];

  static fromEntity(product: Product): ProductDTO {
    if (!product) {
      return null;
    }
    const productDTO = new ProductDTO();
    productDTO.id = product.id;
    productDTO.name = product.name;
    productDTO.description = product.description;
    productDTO.price = product.price;
    productDTO.stock = product.stock;
    productDTO.cartItems = product.cartItems.map(CartItemDTO.fromEntity);
    productDTO.comments = product.comments.map(CommentDTO.fromEntity);
    productDTO.orderItems = product.orderItems.map(OrderItemDTO.fromEntity);
    return productDTO;
  }

  static toEntity(dto: ProductDTO): Product {
    if (!dto) {
      return null;
    }
    const product = new Product();
    product.id = dto.id;
    product.name = dto.name;
    product.description = dto.description;
    product.price = dto.price;
    product.stock = dto.stock;
    product.cartItems = dto.cartItems.map(CartItemDTO.toEntity);
    product.comments = dto.comments.map(CommentDTO.toEntity);
    product.orderItems = dto.orderItems.map(OrderItemDTO.toEntity);
    return product;
  }
}
