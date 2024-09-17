import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CartItemDTO } from 'src/carts/dtos';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { Repository } from 'typeorm';
import { OrderDTO, OrderItemDTO } from '../dtos';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class OrderItemsRepository extends BaseRepository<OrderItem> {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {
    super(orderItemRepo);
  }

  async createOrderItem(
    inputCartItem: CartItemDTO,
    inputOrder: OrderDTO,
  ): Promise<OrderItemDTO> {
    try {
      const cartItem = CartItemDTO.toEntity(inputCartItem);
      const order = OrderDTO.toEntity(inputOrder);

      const rawOrderItem = this.orderItemRepo.create({
        product: cartItem.product,
        quantity: cartItem.quantity,
        order,
        price: cartItem.product.price * cartItem.quantity,
      });
      const orderItem = await this.saveEntity(rawOrderItem);
      return OrderItemDTO.fromEntity(orderItem);
    } catch (error) {
      throw CustomException.fromErrorEnum(
        Errors.E_0032_ORDER_ITEM_CREATION_ERROR,
        {
          data: { cartItem: inputCartItem, order: inputOrder },
          originalError: error,
        },
      );
    }
  }
}
