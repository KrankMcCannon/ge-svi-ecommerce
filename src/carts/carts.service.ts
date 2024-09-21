import { Injectable } from '@nestjs/common';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { ProductDTO } from 'src/products/dtos';
import { UserDTO } from 'src/users/dtos';
import { DataSource, EntityManager } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { AddCartItemToCartDto, CartItemDTO } from './dtos';
import { CartDTO } from './dtos/cart.dto';
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
   * Creates a new cart for the user.
   *
   * @param userId User's ID.
   * @param manager Optional EntityManager for transactional operations.
   * @returns The newly created cart.
   */
  async createCart(userId: string, manager?: EntityManager): Promise<CartDTO> {
    const user = await this.usersService.findById(userId, manager);
    CustomLogger.info(`User found with ID: ${user.id}`);
    const userEntity = UserDTO.toEntity(user);
    const cart = await this.cartsRepository.createCart(userEntity, manager);
    CustomLogger.info(`Cart created with ID: ${cart.id}`);
    return CartDTO.fromEntity(cart);
  }

  /**
   * Adds an item to the user's cart.
   *
   * @param userId User's ID.
   * @param createCartItemDto Data Transfer Object for creating a cart item.
   * @returns The updated or new cart item.
   * @throws CustomException if the product is not found or there is insufficient stock.
   */
  async createCartOrAddToCart(
    userId: string,
    addProductToCartDto: AddCartItemToCartDto,
  ): Promise<CartDTO> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.usersService.findById(
        userId,
        queryRunner.manager,
      );
      CustomLogger.info(`User found with ID: ${user ? user.id : userId}`);
      const userEntity = UserDTO.toEntity(user);
      const product = await this.productsService.findProductById(
        addProductToCartDto.productId,
        queryRunner.manager,
      );
      CustomLogger.info(`Product found with ID: ${product.id}`);
      const productEntity = ProductDTO.toEntity(product);

      if (addProductToCartDto.quantity > product.stock) {
        throw CustomException.fromErrorEnum(Errors.E_0015_INSUFFICIENT_STOCK, {
          data: { productId: addProductToCartDto.productId },
        });
      }

      const cart = await this.cartsRepository.addToCart(
        userEntity,
        productEntity,
        addProductToCartDto.quantity,
        queryRunner.manager,
      );
      CustomLogger.info(`Product added to cart with ID: ${cart.id}`);

      product.stock -= addProductToCartDto.quantity;
      await this.productsService.saveProduct(product, queryRunner.manager);
      CustomLogger.info(`Product stock updated to ${product.stock}`);

      await queryRunner.commitTransaction();

      return await this.cartsRepository.findCartById(
        cart.id,
        queryRunner.manager,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0020_CART_ADD_ERROR, {
        data: { userId, addProductToCartDto },
      });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Retrieves the user's cart.
   *
   * @param userId User's ID.
   * @returns User's cart.
   * @throws CustomException if the cart is not found.
   */
  async findCartByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<CartDTO> {
    const cart = await this.cartsRepository.findCartByUserId(userId, manager);
    if (!cart) {
      throw CustomException.fromErrorEnum(Errors.E_0025_CART_NOT_FOUND, {
        data: { userId },
      });
    }
    CustomLogger.info(`Cart found with ID: ${cart.id}`);
    return CartDTO.fromEntity(cart);
  }

  async findCartById(
    cartId: string,
    manager?: EntityManager,
  ): Promise<CartDTO> {
    const cart = await this.cartsRepository.findCartById(cartId, manager);
    CustomLogger.info(`Cart found with ID: ${cart ? cart.id : cartId}`);
    return CartDTO.fromEntity(cart);
  }

  /**
   * Retrieves all cart items for a user.
   *
   * @param userId User's ID.
   * @param query Optional query options.
   * @param manager Optional transaction manager.
   * @returns An array of cart items.
   */
  async findCartItems(
    cartId: string,
    query?: {
      pagination?: PaginationInfo;
      sort?: string;
      filter?: any;
    },
    manager?: EntityManager,
  ): Promise<CartItemDTO[]> {
    const cartItems = await this.cartItemRepository.findCartItems(
      cartId,
      manager,
      query,
    );
    CustomLogger.info(`Found ${cartItems.length} cart items`);
    return cartItems.map(CartItemDTO.fromEntity);
  }

  /**
   * Removes an item from the user's cart.
   * @param userId User's ID.
   * @param cartItemId Cart item ID.
   * @throws CustomException if the cart item is not found.
   */
  async removeItemFromCart(cartId: string, cartItemId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await this.findCartById(cartId, queryRunner.manager);
      CustomLogger.info(`Cart found with ID: ${cart ? cart.id : cartId}`);
      const cartItem = await this.cartItemRepository.findCartItemById(
        cartItemId,
        queryRunner.manager,
      );
      CustomLogger.info(
        `Cart item found with ID: ${cartItem ? cartItem.id : cartItemId}`,
      );

      if (cartItem.cart.id !== cart.id) {
        throw CustomException.fromErrorEnum(Errors.E_0021_CART_FETCH_ERROR, {
          data: { id: cartItemId },
        });
      }

      if (cartItem.quantity === 1) {
        await this.cartItemRepository.removeCartItem(
          cartItemId,
          queryRunner.manager,
        );
        CustomLogger.info(`Cart item removed with ID: ${cartItemId}`);
      } else {
        cartItem.quantity -= 1;
        await this.cartItemRepository.saveCartItem(
          cartItem,
          queryRunner.manager,
        );
        CustomLogger.info(`Cart item updated with ID: ${cartItemId}`);
      }

      const product = await this.productsService.findProductById(
        cartItem.product.id,
        queryRunner.manager,
      );
      CustomLogger.info(
        `Product found with ID: ${product ? product.id : cartItem.product.id}`,
      );
      product.stock += 1;
      await this.productsService.saveProduct(product, queryRunner.manager);
      CustomLogger.info(`Product stock updated to ${product.stock}`);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof CustomException) {
        throw error;
      }
      CustomException.fromErrorEnum(Errors.E_0022_CART_REMOVE_ERROR, {
        data: { id: cartItemId },
      });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete a cart.
   *
   * @param cartId - Cart ID.
   * @param manager - Optional transaction manager.
   * @throws CustomException if there is an error deleting the cart.
   */
  async deleteCart(cartId: string, manager?: EntityManager): Promise<void> {
    try {
      await this.cartsRepository.deleteCart(cartId, manager);
      CustomLogger.info(`Cart deleted with ID: ${cartId}`);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      CustomException.fromErrorEnum(Errors.E_0022_CART_REMOVE_ERROR, {
        data: { id: cartId },
      });
    }
  }

  /**
   * Clear a cart.
   *
   * @param cartId - Cart ID.
   * @param manager - Optional transaction manager.
   * @throws CustomException if there is an error clearing the cart.
   */
  async clearCart(cartId: string, manager?: EntityManager): Promise<void> {
    try {
      await this.cartsRepository.clearCart(cartId, manager);
      CustomLogger.info(`Cart cleared with ID: ${cartId}`);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      CustomException.fromErrorEnum(Errors.E_0022_CART_REMOVE_ERROR, {
        data: { id: cartId },
      });
    }
  }
}
