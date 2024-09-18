import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StandardResponse } from '../../src/config/standard-response.dto';
import { OrderDTO } from '../../src/orders/dtos/order.dto';
import { OrdersController } from '../../src/orders/orders.controller';
import { OrdersService } from '../../src/orders/orders.service';
import { OrderStatus } from './enum';
import { UserDTO } from 'src/users/dtos';

describe('OrdersController', () => {
  let controller: OrdersController;

  const mockUser: UserDTO = {
    id: 'user-id',
    email: 'ex@mple.com',
    name: 'name',
    role: 'user',
    cart: null,
    orders: [],
  };

  const mockOrderDTO: OrderDTO = {
    id: 'order-id',
    user: mockUser,
    orderItems: [],
    status: OrderStatus.PENDING,
  };

  const mockOrdersService = {
    checkout: jest.fn().mockResolvedValue(mockOrderDTO),
    findOrderById: jest.fn().mockResolvedValue(mockOrderDTO),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [OrdersService],
    })
      .overrideProvider(OrdersService)
      .useValue(mockOrdersService)
      .compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkout', () => {
    it('should return a StandardResponse with OrderDTO', async () => {
      const result = await controller.checkout('user-id');

      expect(result).toEqual(new StandardResponse(mockOrderDTO));
    });

    it('should throw an exception if service fails', async () => {
      mockOrdersService.checkout.mockRejectedValueOnce(
        new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
      );

      await expect(controller.checkout('user-id')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a StandardResponse with OrderDTO', async () => {
      const result = await controller.findOne('order-id');

      expect(result).toEqual(new StandardResponse(mockOrderDTO));
    });

    it('should throw an exception if service fails', async () => {
      mockOrdersService.findOrderById.mockRejectedValueOnce(
        new HttpException('Not Found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.findOne('order-id')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
