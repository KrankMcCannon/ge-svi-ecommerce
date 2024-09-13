import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'The ID of the product to add to the cart' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'The quantity of the product to add to the cart',
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}
