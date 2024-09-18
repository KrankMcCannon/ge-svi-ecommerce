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
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw CustomException.fromErrorEnum(Errors.E_0025_USER_NOT_FOUND, {
        data: { id: userId },
      });
    }

    const userEntity = UserDTO.toEntity(user);
    const cartEntity = await this.cartsRepository.createCart(userEntity);
    const cart = CartDTO.toEntity(cartEntity);

    let savedCart: CartDTO;
    if (manager) {
      savedCart = await manager.save(cartEntity);
    } else {
      savedCart = await this.cartsRepository.saveCart(cart);
    }

    return savedCart;
  }

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
  ): Promise<CartDTO> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userEntity = await this.usersService.findById(userId);
      const user = UserDTO.toEntity(userEntity);
      const product = await this.productsService.findProductById(
        addProductToCartDto.productId,
        queryRunner.manager,
      );
      const productEntity = ProductDTO.toEntity(product);

      if (addProductToCartDto.quantity > product.stock) {
        throw CustomException.fromErrorEnum(Errors.E_0010_INSUFFICIENT_STOCK, {
          data: { productId: addProductToCartDto.productId },
        });
      }

      let cart = await this.cartsRepository.findCart(
        userId,
        queryRunner.manager,
      );
      if (!cart) {
        cart = await this.cartsRepository.createCart(user, queryRunner.manager);
      }
      const cartEntity = CartDTO.toEntity(cart);

      let cartItemEntity =
        await this.cartItemRepository.findCartItemByCartIdAndProductId(
          cart.id,
          product.id,
          queryRunner.manager,
        );

      if (cartItemEntity) {
        // Update quantity if cart item already exists
        cartItemEntity.quantity += addProductToCartDto.quantity;
        await this.cartItemRepository.saveCartItem(
          cartItemEntity,
          queryRunner.manager,
        );
      } else {
        // Create a new cart item
        cartItemEntity = await this.cartItemRepository.createCartItem(
          cartEntity,
          productEntity,
          addProductToCartDto.quantity,
        );
        await this.cartItemRepository.saveCartItem(
          cartItemEntity,
          queryRunner.manager,
        );
        const cartItem = CartItemDTO.toEntity(cartItemEntity);
        cartEntity.cartItems.push(cartItem);
      }

      await this.cartsRepository.saveCart(cartEntity, queryRunner.manager);

      product.stock -= addProductToCartDto.quantity;
      await this.productsService.saveProduct(product, queryRunner.manager);

      await queryRunner.commitTransaction();

      return await this.cartsRepository.findCart(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0012_CART_ADD_ERROR, {
        data: { userId, productId: addProductToCartDto.productId },
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
   */
  async findCart(userId: string): Promise<CartDTO> {
    return await this.cartsRepository.findCart(userId);
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
  ): Promise<CartItemDTO[]> {
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
      const cartItem =
        await this.cartItemRepository.findCartItemByCartIdAndProductId(
          cartItemId,
          productId,
          queryRunner.manager,
        );

      if (cartItem.cart.id !== cart.id || cartItem.product.id !== productId) {
        throw CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND, {
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
        productId,
        queryRunner.manager,
      );
      product.stock += 1;
      await this.productsService.saveProduct(product, queryRunner.manager);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (!(error instanceof CustomException)) {
        CustomLogger.error('Error removing cart item', error);
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async clearCart(cartId: string): Promise<void> {
    await this.cartsRepository.clearCart(cartId);
  }
}
