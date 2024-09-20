import { Injectable } from '@nestjs/common';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { ProductDTO } from 'src/products/dtos';
import { UserDTO } from 'src/users/dtos';
import { DataSource, EntityManager } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { AddCartItemToCartDto, CartItemDTO } from './dtos';
import { CartDTO } from './dtos/cart.dto';
import { Cart } from './entities';
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
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw CustomException.fromErrorEnum(Errors.E_0043_USER_NOT_FOUND, {
        data: { id: userId },
      });
    }

    const userEntity = UserDTO.toEntity(user);
    const cart = await this.cartsRepository.createCart(userEntity);

    let savedCart: Cart;
    if (manager) {
      savedCart = await manager.save(cart);
    } else {
      savedCart = await this.cartsRepository.saveCart(cart);
    }

    return CartDTO.fromEntity(savedCart);
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
      const user = await this.usersService.findById(userId);
      const userEntity = UserDTO.toEntity(user);
      const product = await this.productsService.findProductById(
        addProductToCartDto.productId,
        queryRunner.manager,
      );
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

      product.stock -= addProductToCartDto.quantity;
      await this.productsService.saveProduct(product, queryRunner.manager);

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
    return CartDTO.fromEntity(cart);
  }

  async findCartById(
    cartId: string,
    manager?: EntityManager,
  ): Promise<CartDTO> {
    const cart = await this.cartsRepository.findCartById(cartId, manager);
    if (!cart) {
      throw CustomException.fromErrorEnum(Errors.E_0025_CART_NOT_FOUND, {
        data: { id: cartId },
      });
    }
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
      const cartItem = await this.cartItemRepository.findCartItemById(
        cartItemId,
        queryRunner.manager,
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
      } else {
        cartItem.quantity -= 1;
        await this.cartItemRepository.saveCartItem(
          cartItem,
          queryRunner.manager,
        );
      }

      const product = await this.productsService.findProductById(
        cartItem.product.id,
        queryRunner.manager,
      );
      product.stock += 1;
      await this.productsService.saveProduct(product, queryRunner.manager);

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
