import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'The name of the product' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The description of the product' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The price of the product' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'The stock quantity of the product' })
  @IsNumber()
  @IsNotEmpty()
  stock: number;
}
