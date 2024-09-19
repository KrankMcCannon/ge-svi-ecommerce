import { Test, TestingModule } from '@nestjs/testing';
import { CartDTO, CartItemDTO } from 'src/carts/dtos';
import { ProductDTO } from 'src/products/dtos';
import { UserDTO } from 'src/users/dtos';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { CartsService } from '../../src/carts/carts.service';
import { CustomException } from '../../src/config/custom-exception';
import { Errors } from '../../src/config/errors';
import { OrderDTO } from '../../src/orders/dtos/order.dto';
import { Order } from '../../src/orders/entities';
import { OrderStatus } from '../../src/orders/enum';
import { OrdersService } from '../../src/orders/orders.service';
import { OrderItemsRepository } from '../../src/orders/repositories/order-items.repository';
import { OrdersRepository } from '../../src/orders/repositories/orders.repository';
import { ProductsService } from '../../src/products/products.service';

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
    status: OrderStatus.CREATED,
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
    findOrdersByUserId: jest.fn().mockResolvedValue([mockOrder]),
    updateOrderStatus: jest.fn().mockResolvedValue(mockOrder),
  };

  const mockOrderItemsRepository = {
    createOrderItem: jest.fn().mockResolvedValue(mockCartItem),
    findOrderItemsByOrderId: jest.fn().mockResolvedValue([mockCartItem]),
    findOrderItemById: jest.fn().mockResolvedValue(mockCartItem),
  };

  const mockCartsService = {
    findCartByUserId: jest.fn().mockResolvedValue(mockCart),
    findCartItems: jest.fn().mockResolvedValue([mockCartItem]),
    deleteCart: jest.fn().mockResolvedValue(undefined),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    it('should successfully create an order from cart', async () => {
      const result = await service.checkout(mockUser.id);

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw error if cart is empty', async () => {
      mockCartsService.findCartByUserId.mockResolvedValueOnce(null);

      await expect(service.checkout(mockUser.id)).rejects.toThrow(
        CustomException,
      );
    });

    it('should handle transaction rollback on failure', async () => {
      mockCartsService.deleteCart.mockRejectedValueOnce(
        new Error('Deletion failed'),
      );

      await expect(service.checkout(mockUser.id)).rejects.toThrow(Error);
    });
  });

  describe('findOrderById', () => {
    it('should return an order by ID', async () => {
      const result = await service.findOrderById(mockOrder.id);

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw an exception if order is not found', async () => {
      mockOrdersRepository.findOrderById.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0029_ORDER_NOT_FOUND_ERROR),
      );

      await expect(service.findOrderById('invalid-id')).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('findOrdersByUserId', () => {
    it('should return a list of orders for the user', async () => {
      const result = await service.findOrdersByUserId(mockUser.id);

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockOrder)]),
      );
    });

    it('should return an empty array if no orders are found', async () => {
      mockOrdersRepository.findOrdersByUserId.mockResolvedValueOnce([]);
      const result = await service.findOrdersByUserId(mockUser.id);

      expect(result).toEqual([]);
    });
  });

  describe('findOrderItemsByOrderId', () => {
    it('should return a list of order items for an order', async () => {
      const result = await service.findOrderItemsByOrderId(mockOrder.id);

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockCartItem)]),
      );
    });

    it('should return an empty array if no order items are found', async () => {
      mockOrderItemsRepository.findOrderItemsByOrderId.mockResolvedValueOnce(
        [],
      );
      const result = await service.findOrderItemsByOrderId(mockOrder.id);

      expect(result).toEqual([]);
    });
  });

  describe('findOrderItemById', () => {
    it('should return an order item by ID', async () => {
      const result = await service.findOrderItemById(mockCartItem.id);

      expect(result).toEqual(expect.objectContaining(mockCartItem));
    });

    it('should throw an exception if order item is not found', async () => {
      mockOrderItemsRepository.findOrderItemById.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0033_ORDER_ITEM_NOT_FOUND),
      );

      await expect(service.findOrderItemById('invalid-id')).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the order status', async () => {
      const updatedOrder = { ...mockOrder, status: OrderStatus.SHIPPED };
      mockOrdersRepository.updateOrderStatus.mockResolvedValueOnce(
        updatedOrder,
      );

      const result = await service.updateOrderStatus(
        mockOrder.id,
        OrderStatus.SHIPPED,
      );

      expect(result).toEqual(expect.objectContaining(updatedOrder));
    });

    it('should throw an exception if update fails', async () => {
      mockOrdersRepository.updateOrderStatus.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0030_ORDER_SAVE_ERROR),
      );

      await expect(
        service.updateOrderStatus(mockOrder.id, OrderStatus.SHIPPED),
      ).rejects.toThrow(CustomException);
    });
  });
});
