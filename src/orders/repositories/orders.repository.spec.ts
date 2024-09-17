import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartDTO, CartItemDTO } from 'src/carts/dtos';
import { ProductDTO } from 'src/products/dtos';
import { UserDTO } from 'src/users/dtos';
import { EntityManager } from 'typeorm';
import { OrderDTO, OrderItemDTO } from '../dtos';
import { CreateOrderDTO } from '../dtos/create-order.dto';
import { Order } from '../entities';
import { OrdersRepository } from './orders.repository';

describe('OrdersRepository', () => {
  let repository: OrdersRepository;

  const mockProduct: ProductDTO = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
    cartItems: [],
    comments: [],
    orderItems: [],
  };

  const mockUser: UserDTO = {
    id: '1',
    email: 'ex@mple.com',
    name: 'John Doe',
    role: 'user',
    cart: null,
    orders: [],
  };

  const mockCart: CartDTO = {
    id: '1',
    userId: '1',
    cartItems: [],
  };

  const mockCartItem: CartItemDTO = {
    id: '1',
    productId: mockProduct.id,
    quantity: 2,
    cartId: mockCart.id,
  };

  const mockOrder: OrderDTO = {
    id: '1',
    userId: mockUser.id,
    orderItems: [],
  };

  const mockOrderItem: OrderItemDTO = {
    id: '1',
    productId: mockProduct.id,
    quantity: 2,
    orderId: mockOrder.id,
    price: 100,
  };

  mockUser.cart = mockCart;
  mockUser.orders.push(mockOrder);
  mockCart.cartItems.push(mockCartItem);
  mockOrder.orderItems.push(mockOrderItem);

  const createOrderDto: CreateOrderDTO = {
    userId: mockUser.id,
  };

  const mockOrmRepository = {
    create: jest.fn().mockReturnValue(mockOrder),
    save: jest.fn().mockResolvedValue(mockOrder),
    findOne: jest.fn().mockResolvedValue(mockOrder),
    metadata: {
      target: 'Order',
      primaryColumns: [{ propertyName: 'id' }],
    },
  };

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockOrder),
      metadata: {
        target: 'Order',
        primaryColumns: [{ propertyName: 'id' }],
      },
    }),
  } as unknown as jest.Mocked<EntityManager>;

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

    jest.spyOn(OrderDTO, 'fromEntity').mockImplementation((entity: Order) => {
      return {
        id: entity.id,
        userId: entity.userId,
        orderItems: entity.orderItems,
      } as OrderDTO;
    });
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Create Order', () => {
    it('should create an order', async () => {
      const result = await repository.createOrder(createOrderDto);

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw an error if the order creation fails', async () => {
      mockOrmRepository.save.mockRejectedValue(new Error('Some Error'));

      await expect(repository.createOrder(createOrderDto)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('Find Order By Id', () => {
    it('should find an order by id', async () => {
      const result = await repository.findOrderById(mockOrder.id);

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should find order by id using transaction manager', async () => {
      const result = await repository.findOrderById(
        mockOrder.id,
        mockEntityManager,
      );

      expect(result).toEqual(expect.objectContaining(mockOrder));
    });

    it('should throw an error if the order does not exist', async () => {
      mockOrmRepository.findOne.mockRejectedValue(new Error('Some Error'));

      await expect(repository.findOrderById(mockOrder.id)).rejects.toThrow(
        Error,
      );
    });
  });
});
