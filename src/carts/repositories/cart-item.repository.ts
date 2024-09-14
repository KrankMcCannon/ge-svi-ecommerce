import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { EntityManager, Repository } from 'typeorm';
import { CartItem } from '../entities/cartItem.entity';

@Injectable()
export class CartItemRepository extends BaseRepository<CartItem> {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
  ) {
    super(cartItemRepo);
  }

  /**
   * Retrieves all cart items for a user.
   *
   * @param userId User's ID.
   * @param pagination Pagination information.
   * @returns List of cart items.
   */
  async findCartItems(
    userId: string,
    query: any,
    pagination: PaginationInfo,
  ): Promise<CartItem[]> {
    const qb = this.cartItemRepo.createQueryBuilder('cartItem');
    qb.innerJoinAndSelect('cartItem.product', 'product');
    qb.innerJoin('cartItem.cart', 'cart');
    qb.where('cart.user.id = :userId', { userId });

    this.applyFilters(qb, query);
    this.applySorting(qb, query);
    this.applyPagination(qb, pagination);
    return await qb.getMany();
  }

  /**
   * Retrieves a cart item by ID.
   *
   * @param cartItemId Cart item ID.
   * @param manager Optional transaction manager.
   * @returns The found cart item.
   * @throws CustomException if the cart item is not found.
   */
  async findCartItemById(
    cartItemId: string,
    manager?: EntityManager,
  ): Promise<CartItem> {
    return await this.findEntityById(cartItemId, manager);
  }

  /**
   * Removes an item from the cart.
   *
   * @param cartItemId Cart item ID.
   * @param manager Optional transaction manager.
   * @throws CustomException if the cart item is not found.
   */
  async removeCartItem(
    cartItemId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const cartItemRepo = manager
      ? manager.getRepository(CartItem)
      : this.cartItemRepo;

    const result = await cartItemRepo.delete(cartItemId);
    if (result.affected === 0) {
      throw CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND, {
        data: { id: cartItemId },
      });
    }
  }

  /**
   * Saves a cart item.
   *
   * @param cartItem Cart item to save.
   * @returns The saved cart item.
   */
  async saveCartItem(
    cartItem: CartItem,
    manager?: EntityManager,
  ): Promise<CartItem> {
    const repo = manager ? manager.getRepository(CartItem) : this.repo;
    try {
      return await repo.save(cartItem);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0012_CART_ADD_ERROR, {
        data: { cartItem },
        originalError: error,
      });
    }
  }
}
