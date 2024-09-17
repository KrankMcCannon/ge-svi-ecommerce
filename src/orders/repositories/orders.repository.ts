import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { EntityManager, Repository } from 'typeorm';
import { OrderDTO } from '../dtos';
import { CreateOrderDTO } from '../dtos/create-order.dto';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrdersRepository extends BaseRepository<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {
    super(orderRepo);
  }

  async createOrder(createOrderDto: CreateOrderDTO): Promise<OrderDTO> {
    try {
      const rawOrder = this.orderRepo.create(createOrderDto);
      const order = await this.saveEntity(rawOrder);
      return OrderDTO.fromEntity(order);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0028_ORDER_CREATION_ERROR, {
        data: createOrderDto,
        originalError: error,
      });
    }
  }

  async findOrderById(
    orderId: string,
    manager?: EntityManager,
  ): Promise<OrderDTO> {
    const order = await this.findEntityById(orderId, manager);
    return OrderDTO.fromEntity(order);
  }
}
