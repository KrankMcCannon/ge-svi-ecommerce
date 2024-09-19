import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { UserDTO } from 'src/users/dtos';
import { EntityManager, Repository } from 'typeorm';
import { OrderDTO, OrderItemDTO } from '../dtos';
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
   * @param inputUser - User DTO.
   * @param inputOrderItems - List of order items.
   * @param manager - Optional transaction manager.
   * @returns The created order.
   * @throws CustomException if there is an error creating the order.
   */
  async createOrder(
    inputUser: UserDTO,
    inputOrderItems: OrderItemDTO[],
    manager?: EntityManager,
  ): Promise<OrderDTO> {
    const repo = manager ? manager.getRepository(Order) : this.ordersRepo;
    try {
      const user = UserDTO.toEntity(inputUser);
      const orderItems = inputOrderItems.map(OrderItemDTO.toEntity);
      const entity = repo.create({
        user,
        orderItems,
        status: OrderStatus.CREATED,
        createdAt: new Date(),
      });
      const order = await this.saveEntity(entity, manager);
      return OrderDTO.fromEntity(order);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0028_ORDER_CREATION_ERROR, {
        data: { orderItems: inputOrderItems },
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
  ): Promise<OrderDTO> {
    const order = await this.findEntityById(orderId, manager);
    return OrderDTO.fromEntity(order);
  }

  /**
   * Finds all orders for a user.
   *
   * @param userId - User ID.
   * @returns List of orders.
   */
  async findOrdersByUserId(userId: string): Promise<OrderDTO[]> {
    const orders = await this.ordersRepo.find({
      where: { user: { id: userId } },
    });
    return orders && orders.length > 0 ? orders.map(OrderDTO.fromEntity) : [];
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
  ): Promise<OrderDTO> {
    try {
      const entity = OrderDTO.toEntity(
        await this.findOrderById(orderId, manager),
      );
      entity.status = status;
      const order = await this.saveEntity(entity, manager);
      return OrderDTO.fromEntity(order);
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
