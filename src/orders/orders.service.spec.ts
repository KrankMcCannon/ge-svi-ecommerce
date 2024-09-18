import { Test, TestingModule } from '@nestjs/testing';
import { CartDTO, CartItemDTO } from 'src/carts/dtos';
import { ProductDTO } from 'src/products/dtos';
import { UserDTO } from 'src/users/dtos';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { CartsService } from '../../src/carts/carts.service';
import { CustomException } from '../../src/config/custom-exception';
import { Errors } from '../../src/config/errors';
import { OrderDTO } from '../../src/orders/dtos/order.dto';
import { OrdersService } from '../../src/orders/orders.service';
import { OrderItemsRepository } from '../../src/orders/repositories/order-items.repository';
import { OrdersRepository } from '../../src/orders/repositories/orders.repository';
import { ProductsService } from '../../src/products/products.service';
import { CreateOrderDTO } from './dtos';
import { Order } from './entities';
import { OrderStatus } from './enum';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockUser: UserDTO = {
    id: 'user-id',
    name: 'Test User',
    email: 'ex@mple.com',
    role: 'user',
    cart: null,
    orders: [],
  };

  const mockOrder: OrderDTO = {
    id: 'order-id',
    user: mockUser,
    orderItems: [],
    status: OrderStatus.PENDING,
  };

  const mockCart: CartDTO = {
    id: 'cart-id',
    cartItems: [],
    user: mockUser,
  };

  const mockProduct: ProductDTO = {
    id: 'product-id',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
    cartItems: [],
    comments: [],
    orderItems: [],
  };

  const mockCartItem: CartItemDTO = {
    id: 'cart-item-id',
    product: mockProduct,
    cart: mockCart,
    price: 100,
    quantity: 2,
  };

  mockUser.cart = mockCart;
  mockCart.cartItems.push(mockCartItem);

  const mockOrdersRepository = {
    createOrder: jest.fn().mockResolvedValue(mockOrder),
    findOrderById: jest.fn().mockResolvedValue(mockOrder),
  };

  const mockOrderItemsRepository = {
    createOrderItem: jest.fn().mockResolvedValue(mockCartItem),
  };

  const mockCartsService = {
    findCart: jest.fn().mockResolvedValue(mockCart),
    clearCart: jest.fn().mockResolvedValue(undefined),
  };

  const mockProductsService = {
    findProductById: jest.fn().mockResolvedValue(mockProduct),
    saveProduct: jest.fn().mockResolvedValue(mockProduct),
  };

  const mockEntityManager = {
    getRepository: jest.fn(),
  } as unknown as jest.Mocked<EntityManager>;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: mockEntityManager,
  } as unknown as jest.Mocked<QueryRunner>;

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  } as unknown as DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: mockOrdersRepository },
        { provide: OrderItemsRepository, useValue: mockOrderItemsRepository },
        { provide: CartsService, useValue: mockCartsService },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);

    jest.spyOn(OrderDTO, 'fromEntity').mockImplementation((entity: Order) => {
      return {
        id: entity.id,
        user: entity.user,
        orderItems: entity.orderItems,
        status: entity.status,
      } as OrderDTO;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    const createOrderDto: CreateOrderDTO = {
      userId: 'user-id',
      status: OrderStatus.PENDING,
    };
    it('should create an order successfully', async () => {
      const result = await service.createOrder(createOrderDto);

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw an exception if cart is empty', async () => {
      mockCartsService.findCart.mockResolvedValueOnce(null);

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('findOrderById', () => {
    it('should return an order', async () => {
      const result = await service.findOrderById(mockOrder.id);

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw an exception if order not found', async () => {
      mockOrdersRepository.findOrderById.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0029_ORDER_NOT_FOUND_ERROR),
      );

      await expect(service.findOrderById('invalid-id')).rejects.toThrow(
        CustomException,
      );
    });
  });
});
