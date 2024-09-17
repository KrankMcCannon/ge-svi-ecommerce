import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { EntityManager, Repository } from 'typeorm';
import { CartDTO } from '../dtos/cart.dto';
import { Cart } from '../entities';
import { CartItemsRepository } from './cart-items.repository';
import { ProductDTO } from 'src/products/dtos';

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
    product: ProductDTO,
    quantity: number,
    manager?: EntityManager,
  ): Promise<CartDTO> {
    const cartRepo = manager ? manager.getRepository(Cart) : this.cartRepo;

    let cart = await cartRepo.findOne({ where: { user: { id: userId } } });

    if (!cart) {
      cart = cartRepo.create({ user: { id: userId } });
      await cartRepo.save(cart);
    }

    let cartItem = await this.cartItemRepo.findCartItemByCartIdAndProductId(
      cart.id,
      product.id,
      manager,
    );

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = await this.cartItemRepo.saveCartItem(cartItem, manager);
    }

    await cartRepo.save(cart);

    return CartDTO.fromEntity(cart);
  }

  /**
   * Retrieves a user's cart.
   *
   * @param userId User's ID.
   * @param manager Optional transaction manager.
   * @returns The user's cart.
   */
  async findCart(
    userId: string,
    manager?: EntityManager,
  ): Promise<CartDTO | null> {
    const cart = await this.findEntityById(userId, manager);
    return cart ? CartDTO.fromEntity(cart) : null;
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
