import { Injectable } from '@nestjs/common';
import { CartsService } from 'src/carts/carts.service';
import { CartDTO, CartItemDTO } from 'src/carts/dtos';
import { DataSource } from 'typeorm';
import { OrderItemDTO } from './dtos/order-item.dto';
import { OrderDTO } from './dtos/order.dto';
import { OrderItem } from './entities';
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
      const cart = await this.cartsService.findCartOrFail(userId);
      const cartEntity = CartDTO.toEntity(cart);
      const cartItems = await this.cartsService.findCartItems(cart.id);

      const orderItems: OrderItem[] = [];
      for await (const cartItem of cartItems) {
        const cartItemEntity = CartItemDTO.toEntity(cartItem);
        const orderItemEntity = new OrderItem();
        orderItemEntity.product = cartItemEntity.product;
        orderItemEntity.quantity = cartItemEntity.quantity;
        orderItemEntity.price = cartItemEntity.product.price;
        const orderItem = await this.orderItemsRepo.createOrderItem(
          orderItemEntity,
          queryRunner.manager,
        );
        orderItems.push(orderItem);
      }

      await this.cartsService.clearCart(cartEntity.id, queryRunner.manager);

      const order = await this.ordersRepo.createOrder(
        cartEntity.user,
        orderItems,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      return OrderDTO.fromEntity(order);
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
    const order = await this.ordersRepo.findOrderById(orderId);
    return OrderDTO.fromEntity(order);
  }

  /**
   * Retrieves all orders for a user.
   *
   * @param userId - User ID.
   * @returns List of orders.
   * @throws CustomException if there is an error finding the orders.
   */
  async findOrdersByUserId(userId: string): Promise<OrderDTO[]> {
    const orders = await this.ordersRepo.findOrdersByUserId(userId);
    return orders && orders.length ? orders.map(OrderDTO.fromEntity) : [];
  }

  /**
   * Retrieves all order items for an order.
   *
   * @param orderId - Order ID.
   * @returns List of order items.
   * @throws CustomException if there is an error finding the order items.
   */
  async findOrderItemsByOrderId(orderId: string): Promise<OrderItemDTO[]> {
    const orderItems =
      await this.orderItemsRepo.findOrderItemsByOrderId(orderId);
    return orderItems && orderItems.length
      ? orderItems.map(OrderItemDTO.fromEntity)
      : [];
  }

  /**
   * Retrieves an order item by ID.
   *
   * @param orderItemId - Order item ID.
   * @returns The found order item.
   * @throws CustomException if the order item is not found.
   */
  async findOrderItemById(orderItemId: string): Promise<OrderItemDTO> {
    const orderItem = await this.orderItemsRepo.findOrderItemById(orderItemId);
    return OrderItemDTO.fromEntity(orderItem);
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
    const order = await this.ordersRepo.updateOrderStatus(orderId, status);
    return OrderDTO.fromEntity(order);
  }
}
