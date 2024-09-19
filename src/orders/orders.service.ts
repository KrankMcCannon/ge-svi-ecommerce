import { Injectable } from '@nestjs/common';
import { CartsService } from 'src/carts/carts.service';
import { CartItemDTO } from 'src/carts/dtos';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { DataSource } from 'typeorm';
import { OrderItemDTO } from './dtos/order-item.dto';
import { OrderDTO } from './dtos/order.dto';
import { OrderStatus } from './enum';
import { OrderItemsRepository } from './repositories/order-items.repository';
import { OrdersRepository } from './repositories/orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly cartsService: CartsService,
    private readonly ordersRepo: OrdersRepository,
    private readonly orderItemsRepo: OrderItemsRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new order from the user's cart.
   *
   * @param userId - User's ID.
   * @returns The newly created order.
   * @throws CustomException if there is an error creating the order.
   */
  async checkout(userId: string): Promise<OrderDTO> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await this.cartsService.findCart(userId);
      if (!cart || cart.cartItems.length === 0) {
        throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, {
          data: { message: 'Cart is empty' },
        });
      }

      const cartItems = await this.cartsService.findCartItems(cart.id);
      const orderItems: OrderItemDTO[] = [];
      for await (const cartItem of cartItems) {
        const cartItemEntity = CartItemDTO.toEntity(cartItem);
        const orderItemEntity = new OrderItemDTO();
        orderItemEntity.product = cartItemEntity.product;
        orderItemEntity.quantity = cartItemEntity.quantity;
        orderItemEntity.price = cartItemEntity.product.price;
        const orderItem = await this.orderItemsRepo.createOrderItem(
          orderItemEntity,
          queryRunner.manager,
        );
        orderItems.push(orderItem);
      }

      await this.cartsService.clearCart(cart.id, queryRunner.manager);

      const order = await this.ordersRepo.createOrder(
        cart.user,
        orderItems,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Retrieves an order by ID.
   *
   * @param orderId - Order ID.
   * @returns The found order.
   * @throws CustomException if the order is not found.
   */
  async findOrderById(orderId: string): Promise<OrderDTO> {
    return await this.ordersRepo.findOrderById(orderId);
  }

  /**
   * Retrieves all orders for a user.
   *
   * @param userId - User ID.
   * @returns List of orders.
   * @throws CustomException if there is an error finding the orders.
   */
  async findOrdersByUserId(userId: string): Promise<OrderDTO[]> {
    return await this.ordersRepo.findOrdersByUserId(userId);
  }

  /**
   * Retrieves all order items for an order.
   *
   * @param orderId - Order ID.
   * @returns List of order items.
   * @throws CustomException if there is an error finding the order items.
   */
  async findOrderItemsByOrderId(orderId: string): Promise<OrderItemDTO[]> {
    return await this.orderItemsRepo.findOrderItemsByOrderId(orderId);
  }

  /**
   * Retrieves an order item by ID.
   *
   * @param orderItemId - Order item ID.
   * @returns The found order item.
   * @throws CustomException if the order item is not found.
   */
  async findOrderItemById(orderItemId: string): Promise<OrderItemDTO> {
    return await this.orderItemsRepo.findOrderItemById(orderItemId);
  }

  /**
   * Updates an order status.
   *
   * @param orderId - Order ID.
   * @param status - New status.
   * @returns The updated order.
   * @throws CustomException if there is an error updating the order.
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<OrderDTO> {
    return await this.ordersRepo.updateOrderStatus(orderId, status);
  }
}
