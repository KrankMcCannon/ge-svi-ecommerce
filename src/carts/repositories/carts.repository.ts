import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { Product } from 'src/products/entities';
import { User } from 'src/users/entities';
import { EntityManager, Repository } from 'typeorm';
import { Cart, CartItem } from '../entities';
import { CartItemsRepository } from './cart-items.repository';

@Injectable()
export class CartsRepository extends BaseRepository<Cart> {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepo: Repository<Cart>,
    private readonly cartItemsRepo: CartItemsRepository,
  ) {
    super(cartsRepo);
  }

  /**
   * Creates a new cart for a user.
   *
   * @param user The user entity.
   * @param manager Optional transaction manager.
   * @returns The newly created cart.
   */
  async createCart(user: User, manager?: EntityManager): Promise<Cart> {
    const repo = manager ? manager.getRepository(Cart) : this.cartsRepo;

    const cart = repo.create({ user });
    return await repo.save(cart);
  }

  /**
   * Adds a product to a user's cart or updates the quantity if it already exists.
   *
   * @param userId User's ID.
   * @param productId The product ID.
   * @param quantity The quantity of the product being added.
   * @param manager Optional transaction manager.
   * @returns Updated cart item.
   */
  async addToCart(
    user: User,
    product: Product,
    quantity: number,
    manager?: EntityManager,
  ): Promise<Cart> {
    try {
      let cart = await this.findCartByUserId(user.id, manager);
      if (!cart) {
        cart = await this.createCart(user, manager);
      }

      let cartItem = await this.cartItemsRepo.findCartItemByCartIdAndProductId(
        cart.id,
        product.id,
        manager,
      );

      if (cartItem) {
        if (
          cart.cartItems &&
          cart.cartItems.some((ci) => ci.id === cartItem.id)
        ) {
          throw CustomException.fromErrorEnum(Errors.E_0012_CART_ADD_ERROR, {
            data: {
              user: { id: user.id },
              productId: product.id,
            },
          });
        }
        cartItem.quantity += quantity;
        await this.cartItemsRepo.saveCartItem(cartItem, manager);
      } else {
        cartItem = await this.cartItemsRepo.createCartItem(
          cart,
          product,
          quantity,
          manager,
        );
        if (!cart.cartItems) {
          cart.cartItems = [] as CartItem[];
        }
        cart.cartItems.push(cartItem);
      }

      return await this.saveCart(cart, manager);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0012_CART_ADD_ERROR, {
        data: { user, product, quantity },
        originalError: error,
      });
    }
  }

  /**
   * Retrieves a user's cart.
   *
   * @param userId User's ID.
   * @param manager Optional transaction manager.
   * @returns The user's cart or null if not found.
   * @throws CustomException if the cart is not found.
   */
  async findCartByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<Cart | null> {
    const repo = manager ? manager.getRepository(Cart) : this.repo;
    return await repo.findOne({
      where: { user: { id: userId } },
      relations: ['cartItems'],
    });
  }

  /**
   * Retrieves a user's cart.
   *
   * @param id Cart ID.
   * @param manager Optional transaction manager.
   * @returns The user's cart or null if not found.
   */
  async findCartById(
    id: string,
    manager?: EntityManager,
  ): Promise<Cart | null> {
    const relations = ['cartItems'];
    return await this.findEntityById(id, relations, manager);
  }

  /**
   * Deletes a cart and all associated cart items.
   *
   * @param cartId Cart ID.
   * @param manager Optional transaction manager.
   * @returns Promise that resolves when the cart is deleted.
   * @throws CustomException if the cart is not found.
   */
  async deleteCart(cartId: string, manager?: EntityManager): Promise<void> {
    const cartRepo = manager ? manager.getRepository(Cart) : this.cartsRepo;

    try {
      const relations = ['cartItems'];
      const cart = await this.findEntityById(cartId, relations, manager);

      for await (const cartItem of cart.cartItems) {
        await this.cartItemsRepo.removeCartItem(cartItem.id, manager);
      }

      await cartRepo.delete(cartId);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0014_CART_REMOVE_ERROR, {
        data: { id: cartId },
        originalError: error,
      });
    }
  }

  /**
   * Saves a cart entity.
   *
   * @param cart The cart entity to save.
   * @param manager Optional transaction manager.
   * @returns The saved cart entity as a DTO.
   */
  async saveCart(cart: Cart, manager?: EntityManager): Promise<Cart> {
    const repo = manager ? manager.getRepository(Cart) : this.cartsRepo;

    try {
      return await repo.save(cart);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0012_CART_ADD_ERROR, {
        data: { cart },
        originalError: error,
      });
    }
  }

  /**
   * Remove all items from a cart.
   *
   * @param cartId - Cart ID.
   * @param manager - Optional transaction manager.
   * @throws CustomException if there is an error clearing the cart.
   */
  async clearCart(cartId: string, manager?: EntityManager): Promise<void> {
    const cartRepo = manager ? manager.getRepository(Cart) : this.cartsRepo;

    try {
      const relations = ['cartItems'];
      const cart = await this.findEntityById(cartId, relations, manager);

      for await (const cartItem of cart.cartItems) {
        await this.cartItemsRepo.removeCartItem(cartItem.id, manager);
      }

      await cartRepo.save(cart);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0014_CART_REMOVE_ERROR, {
        data: { id: cartId },
        originalError: error,
      });
    }
  }
}
