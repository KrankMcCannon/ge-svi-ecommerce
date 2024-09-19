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
import { Cart, CartItem } from './entities';
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

      let cartItem =
        await this.cartItemRepository.findCartItemByCartIdAndProductId(
          cart.id,
          product.id,
          queryRunner.manager,
        );

      if (cartItem) {
        cartItem.quantity += addProductToCartDto.quantity;
        await this.cartItemRepository.saveCartItem(
          cartItem,
          queryRunner.manager,
        );
      } else {
        cartItem = await this.cartItemRepository.createCartItem(
          cart,
          productEntity,
          addProductToCartDto.quantity,
          queryRunner.manager,
        );
        cart.cartItems = [] as CartItem[];
        cart.cartItems.push(cartItem);
      }

      await this.cartsRepository.saveCart(cart, queryRunner.manager);

      product.stock -= addProductToCartDto.quantity;
      await this.productsService.saveProduct(product, queryRunner.manager);

      await queryRunner.commitTransaction();

      return await this.cartsRepository.findCart(userId, queryRunner.manager);
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
   * @throws NotFoundException if the cart is not found.
   */
  async findCartOrFail(userId: string): Promise<CartDTO> {
    const cart = await this.cartsRepository.findCartOrFail(userId);
    return CartDTO.fromEntity(cart);
  }

  /**
   * Retrieves all cart items for a user.
   *
   * @param userId User's ID.
   * @returns An array of cart items.
   */
  async findCartItems(
    cartId: string,
    pagination?: PaginationInfo,
    sort?: string,
    filter?: any,
  ): Promise<CartItemDTO[]> {
    const cartItems = await this.cartItemRepository.findCartItems(
      cartId,
      pagination,
      {
        sort,
        ...filter,
      },
    );
    return cartItems.map(CartItemDTO.fromEntity);
  }

  /**
   * Removes an item from the user's cart.
   * @param userId User's ID.
   * @param cartItemId Cart item ID.
   * @param productId Product ID.
   * @throws CustomException if the cart item is not found.
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
      const cart = await this.cartsRepository.findCartOrFail(
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

  async clearCart(cartId: string, manager?: EntityManager): Promise<void> {
    await this.cartsRepository.clearCart(cartId, manager);
  }
}
