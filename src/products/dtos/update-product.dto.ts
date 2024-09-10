import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({ description: 'The name of the product', required: false })
  name?: string;

  @ApiProperty({
    description: 'The description of the product',
    required: false,
  })
  description?: string;

  @ApiProperty({ description: 'The price of the product', required: false })
  price?: number;

  @ApiProperty({
    description: 'The stock quantity of the product',
    required: false,
  })
  stock?: number;
}
