import { Injectable } from '@nestjs/common';
import { CartsService } from 'src/carts/carts.service';
import { CartDTO, CartItemDTO } from 'src/carts/dtos';
import { CustomLogger } from 'src/config/custom-logger';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { EmailProducerService } from 'src/email/email-producer.service';
import { ProductDTO } from 'src/products/dtos';
import { ProductsService } from 'src/products/products.service';
import { DataSource, EntityManager } from 'typeorm';
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
    private readonly productsService: ProductsService,
    private readonly emailProducerService: EmailProducerService,
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
      const cart = await this.cartsService.findCartByUserId(
        userId,
        queryRunner.manager,
      );
      CustomLogger.info(`Cart found with ID: ${cart.id}`);
      const cartEntity = CartDTO.toEntity(cart);
      const cartItems = await this.cartsService.findCartItems(
        cart.id,
        {},
        queryRunner.manager,
      );
      CustomLogger.info(`Found ${cartItems.length} cart items`);

      const orderItems: OrderItem[] = [];
      let totalPrice = 0;
      let orderDetails = `Your order details:\n\n`;
      for await (const cartItem of cartItems) {
        const product = await this.productsService.findProductById(
          cartItem.product.id,
          queryRunner.manager,
        );
        CustomLogger.info(`Product found with ID: ${product.id}`);
        const productEntity = ProductDTO.toEntity(product);
        const cartItemEntity = CartItemDTO.toEntity(cartItem);
        const orderItemEntity = new OrderItem();
        orderItemEntity.product = productEntity;
        orderItemEntity.quantity = cartItemEntity.quantity;
        orderItemEntity.price = productEntity.price;
        const orderItem = await this.orderItemsRepo.createOrderItem(
          orderItemEntity,
          queryRunner.manager,
        );
        CustomLogger.info(`Order item created with ID: ${orderItem.id}`);
        orderItems.push(orderItem);

        orderDetails += `Product: ${productEntity.name}\n`;
        orderDetails += `Quantity: ${cartItemEntity.quantity}\n`;
        orderDetails += `Price: $${productEntity.price.toFixed(2)}\n\n`;

        totalPrice += cartItemEntity.quantity * productEntity.price;
      }

      const order = await this.ordersRepo.createOrder(
        cartEntity.user,
        orderItems,
        queryRunner.manager,
      );
      CustomLogger.info(`Order created with ID: ${order.id}`);

      await this.cartsService.deleteCart(cartEntity.id, queryRunner.manager);
      CustomLogger.info(`Cart deleted with ID: ${cartEntity.id}`);

      await queryRunner.commitTransaction();

      orderDetails += `Total Price: $${totalPrice.toFixed(2)}\n\nThank you for your purchase!`;
      await this.emailProducerService.sendEmailTask({
        email: cartEntity.user.email,
        subject: 'Order Confirmation',
        message: `Your order has been successfully placed!\n\nOrder ID: ${order.id}\n\n${orderDetails}`,
      });

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
    CustomLogger.info(`Order found with ID: ${order.id}`);
    return OrderDTO.fromEntity(order);
  }

  /**
   * Retrieves all orders for a user.
   *
   * @param userId - User ID.
   * @returns List of orders.
   * @throws CustomException if there is an error finding the orders.
   */
  async findOrdersByUserId(
    userId: string,
    query?: {
      pagination?: PaginationInfo;
      sort?: string;
      filter?: any;
    },
    manager?: EntityManager,
  ): Promise<OrderDTO[]> {
    const orders = await this.ordersRepo.findOrdersByUserId(
      userId,
      manager,
      query,
    );
    CustomLogger.info(`Found ${orders.length} orders`);
    return orders.map(OrderDTO.fromEntity);
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
    CustomLogger.info(`Found ${orderItems.length} order items`);
    return orderItems.map(OrderItemDTO.fromEntity);
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
    CustomLogger.info(`Order item found with ID: ${orderItem.id}`);
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
    CustomLogger.info(`Order updated with ID: ${order.id}`);

    await this.emailProducerService.sendEmailTask({
      email: order.user.email,
      subject: 'Order Status Update',
      message: `Your order status has been updated to: ${status}`,
    });

    if (status === OrderStatus.DELIVERED) {
      await this.emailProducerService.sendEmailTask({
        email: order.user.email,
        subject: 'Order Delivered',
        message: `Your order has been successfully delivered!`,
      });
    }

    return OrderDTO.fromEntity(order);
  }
}
