import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { Repository } from 'typeorm';
import { OrderItemDTO } from '../dtos/order-item.dto';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class OrderItemsRepository extends BaseRepository<OrderItem> {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {
    super(orderItemRepo);
  }

  async createOrderItem(orderItemDto: OrderItemDTO): Promise<OrderItem> {
    try {
      const orderItem = this.orderItemRepo.create(orderItemDto);
      return await this.orderItemRepo.save(orderItem);
    } catch (error) {
      throw CustomException.fromErrorEnum(
        Errors.E_0032_ORDER_ITEM_CREATION_ERROR,
        {
          data: orderItemDto,
          originalError: error,
        },
      );
    }
  }
}
