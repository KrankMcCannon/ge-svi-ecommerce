import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { StandardList } from 'src/config/standard-list.dto';
import { StandardResponse } from 'src/config/standard-response.dto';
import { OrderDTO } from 'src/orders/dtos/order.dto';
import { OrderStatus } from 'src/orders/enum';
import { OrdersController } from 'src/orders/orders.controller';
import { OrdersService } from 'src/orders/orders.service';
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
    status: OrderStatus.CREATED,
  };

  const mockOrdersService = {
    checkout: jest.fn().mockResolvedValue(mockOrderDTO),
    findOrderById: jest.fn().mockResolvedValue(mockOrderDTO),
    findOrdersByUserId: jest.fn().mockResolvedValue([mockOrderDTO]),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkout', () => {
    it('should return a StandardResponse with OrderDTO', async () => {
      const req = { user: { id: 'user-id' } };
      const result = await controller.checkout(req);

      expect(result).toEqual(new StandardResponse(mockOrderDTO));
    });

    it('should throw an exception if service fails', async () => {
      mockOrdersService.checkout.mockRejectedValueOnce(
        new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
      );

      const req = { user: { id: 'user-id' } };

      await expect(controller.checkout(req)).rejects.toThrow(HttpException);
    });
  });

  describe('findOrders', () => {
    it('should return a StandardList of orders', async () => {
      const req = { user: { id: 'user-id' } };
      const pagination = new PaginationInfo();
      const result = await controller.findOrders(req, pagination);

      expect(result).toEqual(new StandardList([mockOrderDTO], 1, pagination));
    });

    it('should return an empty StandardList if no orders are found', async () => {
      mockOrdersService.findOrdersByUserId.mockResolvedValueOnce([]);
      const req = { user: { id: 'user-id' } };
      const pagination = new PaginationInfo();
      const result = await controller.findOrders(req, pagination);

      expect(result).toEqual(new StandardList([], 0, pagination));
    });

    it('should throw an exception if service fails', async () => {
      mockOrdersService.findOrdersByUserId.mockRejectedValueOnce(
        new HttpException('Service Error', HttpStatus.INTERNAL_SERVER_ERROR),
      );

      const req = { user: { id: 'user-id' } };
      const pagination = new PaginationInfo();

      await expect(controller.findOrders(req, pagination)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findOrder', () => {
    it('should return a StandardResponse with OrderDTO', async () => {
      const result = await controller.findOrder('order-id');

      expect(result).toEqual(new StandardResponse(mockOrderDTO));
    });

    it('should throw an exception if service fails', async () => {
      mockOrdersService.findOrderById.mockRejectedValueOnce(
        new HttpException('Not Found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.findOrder('invalid-id')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
