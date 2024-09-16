import { ApiProperty } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { Product } from '../entities';

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

  static fromEntity(product: Product): ProductDTO {
    return plainToClass(ProductDTO, product, {
      excludeExtraneousValues: true,
    });
  }

  static toEntity(dto: ProductDTO): Product {
    const product = new Product();
    product.id = dto.id;
    product.name = dto.name;
    product.description = dto.description;
    product.price = dto.price;
    product.stock = dto.stock;
    return product;
  }
}
