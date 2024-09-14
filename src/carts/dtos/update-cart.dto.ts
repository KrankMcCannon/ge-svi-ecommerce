import { PartialType } from '@nestjs/swagger';
import { AddCartItemToCartDto } from './add-cart-item-to-cart.dto';

export class UpdateCartItemDto extends PartialType(AddCartItemToCartDto) {}
