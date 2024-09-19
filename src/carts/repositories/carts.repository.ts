import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { Product } from 'src/products/entities';
import { User } from 'src/users/entities';
import { EntityManager, Repository } from 'typeorm';
import { Cart } from '../entities';
import { CartItemsRepository } from './cart-items.repository';

@Injectable()
export class CartsRepository extends BaseRepository<Cart> {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    private readonly cartItemRepo: CartItemsRepository,
  ) {
    super(cartRepo);
  }

  /**
   * Creates a new cart for a user.
   *
   * @param user The user entity.
   * @param manager Optional transaction manager.
   * @returns The newly created cart.
   */
  async createCart(user: User, manager?: EntityManager): Promise<Cart> {
    const repo = manager ? manager.getRepository(Cart) : this.cartRepo;

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
    userId: string,
    product: Product,
    quantity: number,
    manager?: EntityManager,
  ): Promise<Cart> {
    const repo = manager ? manager.getRepository(Cart) : this.cartRepo;

    let cart = await repo.findOne({ where: { user: { id: userId } } });

    if (!cart) {
      cart = repo.create({ user: { id: userId } });
    }

    let cartItem = await this.cartItemRepo.findCartItemByCartIdAndProductId(
      cart.id,
      product.id,
      manager,
    );

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = await this.cartItemRepo.createCartItem(
        cart,
        product,
        quantity,
        manager,
      );
    }

    return await repo.save(cart);
  }

  /**
   * Retrieves a user's cart.
   *
   * @param userId User's ID.
   * @param manager Optional transaction manager.
   * @returns The user's cart or null if it doesn't exist.
   */
  async findCart(
    userId: string,
    manager?: EntityManager,
  ): Promise<Cart | null> {
    const repo = manager ? manager.getRepository(Cart) : this.cartRepo;
    return await repo.findOne({ where: { user: { id: userId } } });
  }

  /**
   * Retrieves a user's cart.
   *
   * @param userId User's ID.
   * @param manager Optional transaction manager.
   * @returns The user's cart.
   * @throws CustomException if the cart is not found.
   */
  async findCartOrFail(userId: string, manager?: EntityManager): Promise<Cart> {
    return await this.findEntityById(userId, manager);
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
    const cartRepo = manager ? manager.getRepository(Cart) : this.cartRepo;

    try {
      const cart = await this.findEntityById(cartId, manager);

      for await (const cartItem of cart.cartItems) {
        await this.cartItemRepo.removeCartItem(cartItem.id, manager);
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
    const repo = manager ? manager.getRepository(Cart) : this.cartRepo;

    try {
      return await repo.save(cart);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0012_CART_ADD_ERROR, {
        data: { cart },
        originalError: error,
      });
    }
  }

  async clearCart(cartId: string, manager?: EntityManager): Promise<void> {
    const cartRepo = manager ? manager.getRepository(Cart) : this.cartRepo;

    try {
      const cart = await this.findEntityById(cartId, manager);

      for await (const cartItem of cart.cartItems) {
        await this.cartItemRepo.removeCartItem(cartItem.id, manager);
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
