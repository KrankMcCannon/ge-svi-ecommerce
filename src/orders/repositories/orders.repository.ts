import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { EntityManager, Repository } from 'typeorm';
import { CreateOrderDTO } from '../dtos/create-order.dto';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enum';

@Injectable()
export class OrdersRepository extends BaseRepository<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {
    super(orderRepo);
  }

  async createOrder(createOrderDto: CreateOrderDTO): Promise<Order> {
    try {
      const order = this.orderRepo.create({
        ...createOrderDto,
        status: createOrderDto.status || OrderStatus.PENDING,
      });
      return await this.orderRepo.save(order);
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
  ): Promise<Order> {
    try {
      const repo = manager ? manager.getRepository(Order) : this.orderRepo;
      const order = await repo.findOne({ where: { id: orderId } });
      if (!order) {
        throw CustomException.fromErrorEnum(
          Errors.E_0029_ORDER_NOT_FOUND_ERROR,
          {
            data: { orderId },
          },
        );
      }
      return order;
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, {
        data: { orderId },
        originalError: error,
      });
    }
  }
}
