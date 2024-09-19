import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart, CartItem } from 'src/carts/entities';
import { Errors } from 'src/config/errors';
import { Product } from 'src/products/entities';
import { User } from 'src/users/entities';
import { CustomException } from '../../../src/config/custom-exception';
import { Order } from '../../../src/orders/entities/order.entity';
import { OrdersRepository } from '../../../src/orders/repositories/orders.repository';
import { OrderItem } from '../entities';
import { OrderStatus } from '../enum';

describe('OrdersRepository', () => {
  let repository: OrdersRepository;

  const mockCart: Cart = {
    id: 'cart-id',
    user: null,
    cartItems: [],
    createdAt: new Date(),
    updatedAt: undefined,
  };

  const mockCartItem: CartItem = {
    id: 'cart-item-id',
    quantity: 1,
    cart: mockCart,
    product: null,
    price: 100,
  };

  const mockUser: User = {
    id: 'user-id',
    name: 'Test User',
    email: 'ex@mple.com',
    role: 'user',
    cart: mockCart,
    orders: [],
    createdAt: new Date(),
    updatedAt: undefined,
    password: 'password',
  };

  const mockOrder: Order = {
    id: 'order-id',
    user: mockUser,
    orderItems: [],
    status: OrderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: undefined,
  };

  const mockProduct: Product = {
    id: 'product-id',
    name: 'Test Product',
    description: 'Test description',
    price: 100,
    stock: 10,
    cartItems: [],
    orderItems: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: undefined,
  };

  const mockOrderItem: OrderItem = {
    id: 'order-item-id',
    quantity: 1,
    price: 100,
    order: mockOrder,
    product: mockProduct,
  };

  mockCart.user = mockUser;
  mockCart.cartItems.push(mockCartItem);
  mockCartItem.product = mockProduct;
  mockUser.orders.push(mockOrder);
  mockOrder.orderItems.push(mockOrderItem);
  mockProduct.orderItems.push(mockOrderItem);
  mockProduct.cartItems.push(mockCartItem);

  const mockOrmRepository = {
    create: jest.fn().mockReturnValue(mockOrder),
    save: jest.fn().mockResolvedValue(mockOrder),
    findOne: jest.fn().mockResolvedValue(mockOrder),
    getRepository: jest.fn().mockReturnValue({
      create: jest.fn().mockReturnValue(mockOrderItem),
      save: jest.fn().mockResolvedValue(mockOrderItem),
      findOne: jest.fn().mockResolvedValue(mockOrderItem),
      metadata: {
        target: 'Order',
        primaryColumns: [{ propertyName: 'id' }],
      },
    }),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockOrder]),
    }),
    metadata: {
      target: 'Order',
      primaryColumns: [{ propertyName: 'id' }],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersRepository,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<OrdersRepository>(OrdersRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Create an Order', () => {
    it('should create and save an order with default status', async () => {
      const result = await repository.createOrder(mockUser, [mockOrderItem]);

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw an exception if save fails', async () => {
      mockOrmRepository.save.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0028_ORDER_CREATION_ERROR),
      );

      await expect(
        repository.createOrder(mockUser, [mockOrderItem]),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('Find Order By ID', () => {
    it('should find an order by id', async () => {
      const result = await repository.findOrderById(mockOrder.id);

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw an exception if order not found', async () => {
      mockOrmRepository.findOne.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0029_ORDER_NOT_FOUND_ERROR),
      );

      await expect(repository.findOrderById('invalid-id')).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Find Orders by User ID', () => {
    it('should find orders by user id', async () => {
      const result = await repository.findOrdersByUserId(mockUser.id);

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockOrder)]),
      );
    });

    it('should return an empty array if no orders found', async () => {
      (
        mockOrmRepository.createQueryBuilder().getMany as jest.Mock
      ).mockResolvedValue([]);

      const result = await repository.findOrdersByUserId('invalid-id');

      expect(result).toEqual([]);
    });
  });

  describe('Update a Status of Order', () => {
    it('should update the status of an order', async () => {
      const result = await repository.updateOrderStatus(
        mockUser.id,
        OrderStatus.CREATED,
      );

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw an exception if order not found', async () => {
      mockOrmRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        repository.updateOrderStatus('invalid-id', OrderStatus.CREATED),
      ).rejects.toThrow(CustomException);
    });
  });
});
