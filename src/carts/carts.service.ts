import { Injectable } from '@nestjs/common';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { DataSource } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { AddCartItemToCartDto } from './dtos';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem.entity';
import { CartItemsRepository } from './repositories/cart-items.repository';
import { CartsRepository } from './repositories/carts.repository';

@Injectable()
export class CartsService {
  constructor(
    private readonly cartsRepository: CartsRepository,
    private readonly cartItemRepository: CartItemsRepository,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Adds an item to the user's cart.
   *
   * @param userId User's ID.
   * @param createCartItemDto Data Transfer Object for creating a cart item.
   * @returns The updated or new cart item.
   * @throws CustomException if the product is not found or there is insufficient stock.
   */
  async addProductToCart(
    userId: string,
    addProductToCartDto: AddCartItemToCartDto,
  ): Promise<Cart> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.usersService.findById(userId);
      const product = await this.productsService.findProductById(
        addProductToCartDto.productId,
        queryRunner.manager,
      );

      if (addProductToCartDto.quantity > product.stock) {
        throw CustomException.fromErrorEnum(Errors.E_0010_INSUFFICIENT_STOCK, {
          data: { productId: addProductToCartDto.productId },
        });
      }

      product.stock -= addProductToCartDto.quantity;
      await this.productsService.saveProduct(product, queryRunner.manager);

      const cart = await this.cartsRepository.addToCart(
        userId,
        addProductToCartDto,
        product,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return cart;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (!(error instanceof CustomException)) {
        CustomLogger.error('Error adding product to cart', error);
        throw CustomException.fromErrorEnum(Errors.E_0012_CART_ADD_ERROR, {
          data: { productId: addProductToCartDto.productId },
          originalError: error,
        });
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Retrieves all cart items for a user.
   *
   * @param userId User's ID.
   * @returns An array of cart items.
   */
  async findCartItems(
    userId: string,
    pagination: PaginationInfo,
    sort?: string,
    filter?: any,
  ): Promise<CartItem[]> {
    return await this.cartItemRepository.findCartItems(userId, pagination, {
      sort,
      ...filter,
    });
  }

  /**
   * Removes an item from the user's cart.
   * @param userId User's ID.
   * @param cartItemId Cart item ID.
   * @param productId Product ID.
   * @throws NotFoundException if the cart item is not found.
   */
  async removeProductFromCart(
    userId: string,
    cartItemId: string,
    productId: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const cart = await this.cartsRepository.findCart(
        userId,
        queryRunner.manager,
      );
      const cartItem = await this.cartItemRepository.findCartItemById(
        cartItemId,
        queryRunner.manager,
      );
      if (cartItem.cart.id !== cart.id) {
        throw CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND, {
          data: { id: cartItemId },
        });
      }
      const product = await this.productsService.findProductById(
        productId,
        queryRunner.manager,
      );
      if (
        product.cartItems.filter((item) => item.id === cartItemId).length === 0
      ) {
        throw CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND, {
          data: { id: cartItemId },
        });
      }

      if (cartItem.quantity === 1) {
        product.stock += cartItem.quantity;
        await this.cartItemRepository.removeCartItem(
          cartItemId,
          queryRunner.manager,
        );
      }

      cartItem.quantity -= 1;
      product.stock += 1;
      await this.cartItemRepository.saveCartItem(cartItem, queryRunner.manager);
      await this.productsService.saveProduct(product, queryRunner.manager);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (!(error instanceof CustomException)) {
        CustomLogger.error('Error removing cart item', error);
        throw CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND, {
          data: { id: userId },
          originalError: error,
        });
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
