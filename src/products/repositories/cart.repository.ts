import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { AddToCartDto } from '../dtos/add-to-cart.dto';
import { Cart } from '../entities/cart.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
  ) {}

  async addToCart(
    addToCartDto: AddToCartDto,
    product: Product,
    manager?: EntityManager,
  ): Promise<Cart> {
    const repo = manager ? manager.getRepository(Cart) : this.cartRepo;

    try {
      let cartItem = await repo.findOne({
        where: { product: { id: product.id } },
      });

      if (cartItem) {
        cartItem.quantity += addToCartDto.quantity;
      } else {
        cartItem = repo.create({
          product,
          quantity: addToCartDto.quantity,
        });
      }

      return await repo.save(cartItem);
    } catch (error) {
      CustomLogger.error('Error adding product to cart', error);
      throw CustomException.fromErrorEnum(Errors.E_0013_CART_ADD_ERROR, error);
    }
  }

  async findCart(pagination: PaginationInfo): Promise<Cart[]> {
    try {
      const qb = this.cartRepo.createQueryBuilder('cart');
      qb.leftJoinAndSelect('cart.product', 'product');
      this.applyPagination(qb, pagination);
      return await qb.getMany();
    } catch (error) {
      CustomLogger.error('Error fetching cart items', error);
      throw CustomException.fromErrorEnum(
        Errors.E_0014_CART_FETCH_ERROR,
        error,
      );
    }
  }

  async findOneById(id: string, manager?: EntityManager): Promise<Cart> {
    const repo = manager ? manager.getRepository(Cart) : this.cartRepo;
    try {
      const cart = await repo.findOne({ where: { id } });
      if (!cart) {
        throw CustomException.fromErrorEnum(Errors.E_0016_CART_ITEM_NOT_FOUND, {
          errorDescription: 'Cart item not found',
        });
      }
      return cart;
    } catch (error) {
      CustomLogger.error(`Error finding cart item with ID ${id}`, error);
      throw error;
    }
  }

  async removeCartItem(id: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(Cart) : this.cartRepo;
    try {
      const result = await repo.delete(id);
      if (result.affected === 0) {
        throw CustomException.fromErrorEnum(Errors.E_0016_CART_ITEM_NOT_FOUND, {
          errorDescription: 'Cart item not found',
        });
      }
    } catch (error) {
      CustomLogger.error(`Error removing cart item with ID ${id}`, error);
      throw CustomException.fromErrorEnum(
        Errors.E_0016_CART_ITEM_NOT_FOUND,
        error,
      );
    }
  }

  private applyPagination(
    qb: SelectQueryBuilder<Cart>,
    pagination: PaginationInfo,
  ) {
    const { pageNumber = 0, pageSize = 20 } = pagination;
    qb.skip(pageNumber * pageSize).take(pageSize);
  }
}
