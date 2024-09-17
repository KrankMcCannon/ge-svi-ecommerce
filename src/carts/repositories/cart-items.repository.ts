import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { EntityManager, Repository } from 'typeorm';
import { CartItem } from '../entities/cartItem.entity';
import { CartItemDTO } from '../dtos/cart-item.dto';

@Injectable()
export class CartItemsRepository extends BaseRepository<CartItem> {
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
    pagination: PaginationInfo,
    query?: any,
  ): Promise<CartItemDTO[]> {
    const qb = this.cartItemRepo.createQueryBuilder('cartItem');
    qb.innerJoinAndSelect('cartItem.product', 'product')
      .innerJoin('cartItem.cart', 'cart')
      .where('cart.user.id = :userId', { userId });

    this.applyFilters(qb, query);
    this.applySorting(qb, query.sort);
    this.applyPagination(qb, pagination);

    const cartItems = await qb.getMany();
    return cartItems.map(CartItemDTO.fromEntity);
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
  ): Promise<CartItemDTO | null> {
    const cartItem = await this.findEntityById(cartItemId, manager);
    return cartItem ? CartItemDTO.fromEntity(cartItem) : null;
  }

  async findCartItemByCartIdAndProductId(
    cartId: string,
    productId: string,
    manager?: EntityManager,
  ): Promise<CartItemDTO | null> {
    const repo = manager ? manager.getRepository(CartItem) : this.repo;
    const cartItem = await repo.findOne({
      where: { cart: { id: cartId }, product: { id: productId } },
    });
    return cartItem ? CartItemDTO.fromEntity(cartItem) : null;
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
   * @param inputCartItem Cart item to save.
   * @returns The saved cart item.
   */
  async saveCartItem(
    inputCartItem: CartItemDTO,
    manager?: EntityManager,
  ): Promise<CartItemDTO> {
    const repo = manager ? manager.getRepository(CartItem) : this.repo;
    const cartItem = CartItemDTO.toEntity(inputCartItem);
    try {
      const savedCartItem = await repo.save(cartItem);
      return CartItemDTO.fromEntity(savedCartItem);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0012_CART_ADD_ERROR, {
        data: { cartItem },
        originalError: error,
      });
    }
  }
}
