import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AddToCartDto } from '../dtos';
import { Cart } from '../entities/cart.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
  ) {}

  async addToCart(addToCartDto: AddToCartDto, product: Product): Promise<Cart> {
    try {
      let cartItem = await this.cartRepo.findOne({
        where: { product: { id: product.id } },
      });

      if (cartItem) {
        cartItem.quantity += addToCartDto.quantity;
      } else {
        cartItem = this.cartRepo.create({
          product,
          quantity: addToCartDto.quantity,
        });
      }

      return await this.cartRepo.save(cartItem);
    } catch (error) {
      CustomLogger.error('Error adding product to cart', error);
      throw CustomException.fromErrorEnum(Errors.E_0013_CART_ADD_ERROR, error);
    }
  }

  async findCart(pagination: PaginationInfo): Promise<Cart[]> {
    try {
      const qb = this.cartRepo.createQueryBuilder('cart');
      this.applyPagination(qb, pagination);
      return await qb.getMany();
    } catch (error) {
      CustomLogger.error('Error fetching cart items', error);
      throw CustomException.fromErrorEnum(
        Errors.E_0015_CART_ITEM_NOT_FOUND,
        error,
      );
    }
  }

  async findOneById(id: number): Promise<Cart> {
    try {
      const cart = await this.cartRepo.findOne({ where: { id } });
      if (!cart) {
        throw CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND, {
          errorDescription: 'Cart item not found',
        });
      }
      return cart;
    } catch (error) {
      CustomLogger.error(`Error finding cart item with ID ${id}`, error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async removeCartItem(id: number): Promise<void> {
    try {
      const result = await this.cartRepo.delete(id);
      if (result.affected === 0) {
        throw CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND, {
          errorDescription: 'Cart item not found',
        });
      }
    } catch (error) {
      CustomLogger.error(`Error removing cart item with ID ${id}`, error);
      throw CustomException.fromErrorEnum(
        Errors.E_0014_CART_REMOVE_ERROR,
        error,
      );
    }
  }

  private applyPagination(
    qb: SelectQueryBuilder<Cart>,
    pagination: PaginationInfo,
  ) {
    const { pageNumber = 1, pageSize = 20 } = pagination;
    qb.skip((pageNumber - 1) * pageSize).take(pageSize);
  }
}
