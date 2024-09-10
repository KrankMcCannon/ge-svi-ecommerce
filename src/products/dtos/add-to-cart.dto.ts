import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'The ID of the product to add to the cart' })
  productId: number;

  @ApiProperty({
    description: 'The quantity of the product to add to the cart',
  })
  quantity: number;
}
