import { Injectable } from '@nestjs/common';
import { CartsService } from 'src/carts/carts.service';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { ProductsService } from 'src/products/products.service';
import { DataSource } from 'typeorm';
import { CreateOrderDTO } from './dtos/create-order.dto';
import { OrderItemDTO } from './dtos/order-item.dto';
import { OrderDTO } from './dtos/order.dto';
import { OrderStatus } from './enum';
import { OrderItemsRepository } from './repositories/order-items.repository';
import { OrdersRepository } from './repositories/orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly cartsService: CartsService,
    private readonly productsService: ProductsService,
    private readonly ordersRepository: OrdersRepository,
    private readonly orderItemsRepository: OrderItemsRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(createOrderDto: CreateOrderDTO): Promise<OrderDTO> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.ordersRepository.createOrder(createOrderDto);
      const cart = await this.cartsService.findCart(createOrderDto.userId);

      if (!cart || cart.cartItems.length === 0) {
        throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, {
          data: { message: 'Cart is empty' },
        });
      }

      for await (const cartItem of cart.cartItems) {
        const product = await this.productsService.findProductById(
          cartItem.product.id,
          queryRunner.manager,
        );

        const orderItemDto = new OrderItemDTO();
        orderItemDto.quantity = cartItem.quantity;
        orderItemDto.price = product.price;
        orderItemDto.product = product;
        orderItemDto.order = order;

        await this.orderItemsRepository.createOrderItem(orderItemDto);
        product.stock -= cartItem.quantity;
        await this.productsService.saveProduct(product, queryRunner.manager);
      }

      await this.cartsService.clearCart(cart.id);

      await queryRunner.commitTransaction();
      return OrderDTO.fromEntity(order);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOrderById(orderId: string): Promise<OrderDTO> {
    const order = await this.ordersRepository.findOrderById(orderId);
    return OrderDTO.fromEntity(order);
  }

  async checkout(userId: string): Promise<OrderDTO> {
    const createOrderDto = new CreateOrderDTO();
    createOrderDto.userId = userId;
    createOrderDto.status = OrderStatus.PENDING;
    return this.createOrder(createOrderDto);
  }
}
