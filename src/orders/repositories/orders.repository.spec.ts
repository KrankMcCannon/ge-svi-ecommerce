import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities';
import { CustomException } from '../../../src/config/custom-exception';
import { Order } from '../../../src/orders/entities/order.entity';
import { OrdersRepository } from '../../../src/orders/repositories/orders.repository';
import { OrderStatus } from '../enum';

describe('OrdersRepository', () => {
  let repository: OrdersRepository;

  const mockUser: User = {
    id: 'user-id',
    name: 'Test User',
    email: 'ex@mple.com',
    password: 'password',
    role: 'user',
    cart: null,
    orders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrder: Order = {
    id: 'order-id',
    user: mockUser,
    orderItems: [],
    status: OrderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderRepo = {
    create: jest.fn().mockReturnValue(mockOrder),
    save: jest.fn().mockResolvedValue(mockOrder),
    findOne: jest.fn().mockResolvedValue(mockOrder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersRepository,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepo,
        },
      ],
    }).compile();

    repository = module.get<OrdersRepository>(OrdersRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create and save an order with default status', async () => {
      const result = await repository.createOrder({ userId: 'user-id' });

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should create and save an order with specified status', async () => {
      const result = await repository.createOrder({
        userId: 'user-id',
        status: OrderStatus.PROCESSING,
      });

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw an exception if save fails', async () => {
      mockOrderRepo.save.mockRejectedValueOnce(new Error('Save failed'));

      await expect(
        repository.createOrder({ userId: 'user-id' }),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('findOrderById', () => {
    it('should find an order by id', async () => {
      const result = await repository.findOrderById('order-id');

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw an exception if order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValueOnce(null);

      await expect(repository.findOrderById('invalid-id')).rejects.toThrow(
        CustomException,
      );
    });
  });
});
