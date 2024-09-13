import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({ description: 'The name of the product', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The description of the product',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The price of the product', required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'The stock quantity of the product',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  stock?: number;
}
