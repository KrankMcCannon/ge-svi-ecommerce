import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';
import { ProductDTO } from 'src/products/dtos';
import { Product } from 'src/products/entities';
import { Cart } from '../entities';
import { CartItem } from '../entities/cartItem.entity';
import { CartDTO } from './cart.dto';

export class CartItemDTO {
  @ApiProperty({ description: 'The unique identifier for a cart item' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'The cart associated with this cart item',
    type: CartDTO,
  })
  @Type(() => CartDTO)
  cart: CartDTO;

  @ApiProperty({
    description: 'The product associated with this cart item',
    type: ProductDTO,
  })
  @Type(() => ProductDTO)
  product: ProductDTO;

  @ApiProperty({ description: 'The quantity of the product in the cart' })
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'The price of the product in the cart' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  static fromEntity(cartItem: CartItem): CartItemDTO {
    if (!cartItem) {
      return null;
    }
    const cartItemDTO = new CartItemDTO();
    cartItemDTO.id = cartItem.id;
    cartItemDTO.quantity = cartItem.quantity;
    cartItemDTO.price = cartItem.price;
    if (cartItem.cart) {
      cartItemDTO.cart = new CartDTO();
      cartItemDTO.cart.id = cartItem.cart.id;
    }
    if (cartItem.product) {
      cartItemDTO.product = new ProductDTO();
      cartItemDTO.product.id = cartItem.product.id;
    }
    return cartItemDTO;
  }

  static toEntity(cartItemDTO: CartItemDTO): CartItem {
    if (!cartItemDTO) {
      return null;
    }
    const cartItem = new CartItem();
    cartItem.id = cartItemDTO.id;
    cartItem.quantity = cartItemDTO.quantity;
    cartItem.price = cartItemDTO.price;
    if (cartItemDTO.cart) {
      cartItem.cart = new Cart();
      cartItem.cart.id = cartItemDTO.cart.id;
    }
    if (cartItemDTO.product) {
      cartItem.product = new Product();
      cartItem.product.id = cartItemDTO.product.id;
    }
    return cartItem;
  }
}
