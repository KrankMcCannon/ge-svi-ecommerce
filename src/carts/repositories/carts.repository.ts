import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { Product } from 'src/products/entities';
import { EntityManager, Repository } from 'typeorm';
import { AddCartItemToCartDto } from '../dtos';
import { Cart } from '../entities';
import { CartItem } from '../entities/cartItem.entity';

@Injectable()
export class CartsRepository extends BaseRepository<Cart> {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
  ) {
    super(cartRepo);
  }

  /**
   * Adds a product to a user's cart or updates the quantity if it already exists.
   *
   * @param userId User's ID.
   * @param addCartItemToCartDto DTO containing productId and quantity.
   * @param product The product being added.
   * @param manager Optional transaction manager.
   * @returns Updated cart item.
   */
  async addToCart(
    userId: string,
    addCartItemToCartDto: AddCartItemToCartDto,
    product: Product,
    manager?: EntityManager,
  ): Promise<Cart> {
    const cartRepo = manager ? manager.getRepository(Cart) : this.cartRepo;
    const cartItemRepo = manager
      ? manager.getRepository(CartItem)
      : this.cartItemRepo;

    // Find or create the user's cart
    let cart = await cartRepo.findOne({ where: { user: { id: userId } } });
    if (!cart) {
      cart = cartRepo.create({ user: { id: userId } });
      await cartRepo.save(cart);
    }

    // Check if the product is already in the cart
    let cartItem = await cartItemRepo.findOne({
      where: { cart: { id: cart.id }, product: { id: product.id } },
    });

    // Update quantity or create new cart item
    if (cartItem) {
      cartItem.quantity += addCartItemToCartDto.quantity;
    } else {
      cartItem = cartItemRepo.create({
        cart,
        product,
        quantity: addCartItemToCartDto.quantity,
      });
    }

    await cartItemRepo.save(cartItem);
    return cart;
  }

  /**
   * Retrieves a user's cart.
   *
   * @param userId User's ID.
   * @param manager Optional transaction manager.
   * @returns The user's cart.
   */
  async findCart(userId: string, manager?: EntityManager): Promise<Cart> {
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
      await this.cartItemRepo.delete({ cart });
      await cartRepo.delete(cartId);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0014_CART_REMOVE_ERROR, {
        data: { id: cartId },
        originalError: error,
      });
    }
  }
}
