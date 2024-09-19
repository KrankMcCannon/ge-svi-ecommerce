import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { User } from 'src/users/entities';
import { EntityManager, Repository } from 'typeorm';
import { OrderItem } from '../entities';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enum';

@Injectable()
export class OrdersRepository extends BaseRepository<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
  ) {
    super(ordersRepo);
  }

  /**
   * Creates a new order.
   *
   * @param user - User DTO.
   * @param orderItems - List of order items.
   * @param manager - Optional transaction manager.
   * @returns The created order.
   * @throws CustomException if there is an error creating the order.
   */
  async createOrder(
    user: User,
    orderItems: OrderItem[],
    manager?: EntityManager,
  ): Promise<Order> {
    const repo = manager ? manager.getRepository(Order) : this.ordersRepo;
    try {
      const entity = repo.create({
        user,
        orderItems,
        status: OrderStatus.CREATED,
        createdAt: new Date(),
      });
      return await this.saveEntity(entity, manager);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0028_ORDER_CREATION_ERROR, {
        data: { orderItems },
        originalError: error,
      });
    }
  }

  /**
   * Finds an order by ID.
   *
   * @param orderId - Order ID.
   * @param manager - Optional transaction manager.
   * @returns The found order.
   * @throws CustomException if the order is not found.
   */
  async findOrderById(
    orderId: string,
    manager?: EntityManager,
  ): Promise<Order> {
    return await this.findEntityById(orderId, manager);
  }

  /**
   * Finds all orders for a user.
   *
   * @param userId - User ID.
   * @returns List of orders.
   */
  async findOrdersByUserId(userId: string): Promise<Order[]> {
    return await this.ordersRepo.find({
      where: { user: { id: userId } },
    });
  }

  /**
   * Updates an order status.
   *
   * @param orderId - Order ID.
   * @param status - New status.
   * @param manager - Optional transaction manager.
   * @returns The updated order.
   * @throws CustomException if there is an error updating the order.
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    manager?: EntityManager,
  ): Promise<Order> {
    try {
      const order = await this.findOrderById(orderId, manager);
      order.status = status;
      return await this.saveEntity(order, manager);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0030_ORDER_SAVE_ERROR, {
        data: { id: orderId },
        originalError: error,
      });
    }
  }
}
