import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { Product } from 'src/products/entities';
import { EntityManager, Repository } from 'typeorm';
import { Cart } from '../entities';
import { CartItem } from '../entities/cartItem.entity';

@Injectable()
export class CartItemsRepository extends BaseRepository<CartItem> {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
  ) {
    super(cartItemRepo);
  }

  /**
   * Creates a new cart item.
   *
   * @param cart The cart entity to which the item belongs.
   * @param product The product entity being added.
   * @param quantity The quantity of the product.
   * @param manager Optional transaction manager.
   * @returns The newly created cart item.
   */
  async createCartItem(
    cart: Cart,
    product: Product,
    quantity: number,
    manager?: EntityManager,
  ): Promise<CartItem> {
    const repo = manager ? manager.getRepository(CartItem) : this.cartItemRepo;

    try {
      const cartItem = repo.create({
        cart,
        product,
        quantity,
        price: product.price,
      });
      return await this.saveEntity(cartItem, manager);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      CustomException.fromErrorEnum(Errors.E_0012_CART_ADD_ERROR, {
        data: { cart, product, quantity },
        originalError: error,
      });
    }
  }

  /**
   * Retrieves all cart items for a user.
   *
   * @param userId User's ID.
   * @param manager Optional transaction manager.
   * @param query Optional query parameters.
   * @returns List of cart items.
   */
  async findCartItems(
    cartId: string,
    manager?: EntityManager,
    query?: { pagination?: PaginationInfo; sort?: string; filter?: any },
  ): Promise<CartItem[]> {
    const repo = manager ? manager.getRepository(CartItem) : this.repo;
    const qb = repo.createQueryBuilder('cartItem');
    qb.innerJoinAndSelect('cartItem.product', 'product')
      .innerJoin('cartItem.cart', 'cart')
      .where('cart.id = :cartId', { cartId });

    this.applyFilters(qb, query?.filter);
    this.applyPagination(qb, query?.pagination);
    this.applySorting(qb, query?.sort);

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
  ): Promise<CartItem | null> {
    const relations = ['product', 'cart'];
    return await this.findEntityById(cartItemId, relations, manager);
  }

  async findCartItemByCartIdAndProductId(
    cartId: string,
    productId: string,
    manager?: EntityManager,
  ): Promise<CartItem | null> {
    const repo = manager ? manager.getRepository(CartItem) : this.repo;
    return await repo.findOne({
      where: { cart: { id: cartId }, product: { id: productId } },
      relations: ['product', 'cart'],
    });
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
