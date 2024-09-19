import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartDTO, CartItemDTO } from 'src/carts/dtos';
import { Errors } from 'src/config/errors';
import { ProductDTO } from 'src/products/dtos';
import { UserDTO } from 'src/users/dtos';
import { CustomException } from '../../../src/config/custom-exception';
import { Order } from '../../../src/orders/entities/order.entity';
import { OrdersRepository } from '../../../src/orders/repositories/orders.repository';
import { OrderDTO, OrderItemDTO } from '../dtos';
import { OrderStatus } from '../enum';

describe('OrdersRepository', () => {
  let repository: OrdersRepository;

  const mockCart: CartDTO = {
    id: 'cart-id',
    user: null,
    cartItems: [],
  };

  const mockCartItem: CartItemDTO = {
    id: 'cart-item-id',
    quantity: 1,
    cart: mockCart,
    product: null,
    price: 100,
  };

  const mockUser: UserDTO = {
    id: 'user-id',
    name: 'Test User',
    email: 'ex@mple.com',
    role: 'user',
    cart: mockCart,
    orders: [],
  };

  const mockOrder: OrderDTO = {
    id: 'order-id',
    user: mockUser,
    orderItems: [],
    status: OrderStatus.PENDING,
  };

  const mockProduct: ProductDTO = {
    id: 'product-id',
    name: 'Test Product',
    description: 'Test description',
    price: 100,
    stock: 10,
    cartItems: [],
    orderItems: [],
    comments: [],
  };

  const mockOrderItem: OrderItemDTO = {
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

  describe('Create an Order', () => {
    it('should create and save an order with default status', async () => {
      const result = await repository.createOrder(mockUser, [mockOrderItem]);

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw an exception if save fails', async () => {
      mockOrderRepo.save.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0028_ORDER_CREATION_ERROR),
      );

      await expect(
        repository.createOrder(mockUser, [mockOrderItem]),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('Find Order By ID', () => {
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

  describe('Find Orders by User ID', () => {
    it('should find orders by user id', async () => {
      const result = await repository.findOrdersByUserId('user-id');

      expect(result).toEqual(expect.arrayContaining([mockOrder]));
    });

    it('should return an empty array if no orders found', async () => {
      mockOrderRepo.findOne.mockResolvedValueOnce(null);

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
      mockOrderRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        repository.updateOrderStatus('invalid-id', OrderStatus.CREATED),
      ).rejects.toThrow(CustomException);
    });
  });
});
