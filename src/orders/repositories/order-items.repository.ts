import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { EntityManager, Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class OrderItemsRepository extends BaseRepository<OrderItem> {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,
  ) {
    super(orderItemsRepo);
  }

  /**
   * Creates a new order item.
   *
   * @param inputOrderItem - Order item entity.
   * @param manager - Optional transaction manager.
   * @returns The newly created order item.
   * @throws CustomException if there is an error creating the order item.
   */
  async createOrderItem(
    inputOrderItem: OrderItem,
    manager?: EntityManager,
  ): Promise<OrderItem> {
    const repo = manager
      ? manager.getRepository(OrderItem)
      : this.orderItemsRepo;
    try {
      const orderItem = repo.create(inputOrderItem);
      return await this.saveEntity(orderItem, manager);
    } catch (error) {
      throw CustomException.fromErrorEnum(
        Errors.E_0032_ORDER_ITEM_CREATION_ERROR,
        {
          data: { inputOrderItem },
          originalError: error,
        },
      );
    }
  }

  /**
   * Finds all order items for an order.
   *
   * @param orderId - Order ID.
   * @returns List of order items.
   * @throws CustomException if there is an error finding the order items.
   */
  async findOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return await this.orderItemsRepo.find({
      where: { order: { id: orderId } },
    });
  }

  /**
   * Finds an order item by ID.
   *
   * @param orderItemId - Order item ID.
   * @returns The found order item.
   * @throws CustomException if the order item is not found.
   */
  async findOrderItemById(orderItemId: string): Promise<OrderItem> {
    return await this.findEntityById(orderItemId);
  }
}
