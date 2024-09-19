import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
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
    const relations = ['orderItems'];
    return await this.findEntityById(orderId, relations, manager);
  }

  /**
   * Finds all orders for a user.
   *
   * @param userId - User ID.
   * @param manager - Optional transaction manager.
   * @param query - Optional query parameters.
   * @returns List of orders.
   */
  async findOrdersByUserId(
    userId: string,
    manager?: EntityManager,
    query?: { pagination: PaginationInfo; sort: string; filter: any },
  ): Promise<Order[]> {
    const repo = manager ? manager.getRepository(Order) : this.repo;
    const qb = repo.createQueryBuilder('order');
    qb.where('order.userId = :userId', { userId }).leftJoinAndSelect(
      'order.orderItems',
      'orderItems',
    );

    this.applyFilters(qb, query?.filter);
    this.applyPagination(qb, query?.pagination);
    this.applySorting(qb, query?.sort);

    return await qb.getMany();
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
