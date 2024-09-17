import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../../src/orders/orders.service';
import { OrdersRepository } from '../../src/orders/repositories/orders.repository';
import { OrderItemsRepository } from '../../src/orders/repositories/order-items.repository';
import { CartsService } from '../../src/carts/carts.service';
import { ProductsService } from '../../src/products/products.service';
import { Order } from '../../src/orders/entities/order.entity';
import { OrderDTO } from '../../src/orders/dtos/order.dto';
import { CustomException } from '../../src/config/custom-exception';
import { Errors } from '../../src/config/errors';
import { OrderStatus } from './enum';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrder: Order = {
    id: 'order-id',
    userId: 'user-id',
    orderItems: [],
    status: OrderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrdersRepository = {
    createOrder: jest.fn().mockResolvedValue(mockOrder),
    findOrderById: jest.fn().mockResolvedValue(mockOrder),
  };

  const mockOrderItemsRepository = {
    createOrderItem: jest.fn().mockResolvedValue({}),
  };

  const mockCartsService = {
    findCart: jest.fn().mockResolvedValue({
      id: 'cart-id',
      userId: 'user-id',
      cartItems: [],
    }),
    clearCart: jest.fn().mockResolvedValue(undefined),
  };

  const mockProductsService = {
    findProductById: jest.fn().mockResolvedValue({ price: 100 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        OrdersRepository,
        OrderItemsRepository,
        CartsService,
        ProductsService,
      ],
    })
      .overrideProvider(OrdersRepository)
      .useValue(mockOrdersRepository)
      .overrideProvider(OrderItemsRepository)
      .useValue(mockOrderItemsRepository)
      .overrideProvider(CartsService)
      .useValue(mockCartsService)
      .overrideProvider(ProductsService)
      .useValue(mockProductsService)
      .compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const result = await service.createOrder({ userId: 'user-id' });

      expect(result).toEqual(OrderDTO.fromEntity(mockOrder));
    });

    it('should throw an exception if cart is empty', async () => {
      mockCartsService.findCart.mockResolvedValueOnce(null);

      await expect(service.createOrder({ userId: 'user-id' })).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('findOrderById', () => {
    it('should return an order', async () => {
      const result = await service.findOrderById('order-id');

      expect(result).toEqual(OrderDTO.fromEntity(mockOrder));
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
