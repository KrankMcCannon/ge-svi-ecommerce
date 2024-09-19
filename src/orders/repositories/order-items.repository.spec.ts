import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart, CartItem } from 'src/carts/entities';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { Product } from 'src/products/entities';
import { User } from 'src/users/entities';
import { EntityManager, Repository } from 'typeorm';
import { OrderItemDTO } from '../dtos';
import { Order, OrderItem } from '../entities';
import { OrderStatus } from '../enum';
import { OrderItemsRepository } from './order-items.repository';

describe('OrderItemsRepository', () => {
  let repository: OrderItemsRepository;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
    cartItems: [],
    comments: [],
    orderItems: [],
    createdAt: new Date(),
    updatedAt: null,
  };

  const mockUser: User = {
    id: '1',
    email: 'ex@mple.com',
    name: 'John Doe',
    role: 'user',
    cart: null,
    orders: [],
    createdAt: new Date(),
    updatedAt: null,
    password: 'password',
  };

  const mockCart: Cart = {
    id: '1',
    cartItems: [],
    user: mockUser,
    createdAt: new Date(),
    updatedAt: null,
  };

  const mockCartItem: CartItem = {
    id: '1',
    product: mockProduct,
    cart: mockCart,
    quantity: 2,
    price: 100,
  };

  const mockOrder: Order = {
    id: '1',
    user: mockUser,
    status: OrderStatus.PENDING,
    orderItems: [],
    createdAt: new Date(),
    updatedAt: null,
  };

  const mockOrderItem: OrderItem = {
    id: '1',
    product: mockProduct,
    order: mockOrder,
    quantity: 2,
    price: 100,
  };

  mockUser.cart = mockCart;
  mockUser.orders.push(mockOrder);
  mockUser.orders.push(mockOrder);
  mockCart.cartItems.push(mockCartItem);
  mockOrder.orderItems.push(mockOrderItem);
  mockProduct.cartItems.push(mockCartItem);
  mockProduct.orderItems.push(mockOrderItem);

  const mockOrmRepository = {
    create: jest.fn().mockReturnValue(mockOrderItem),
    save: jest.fn().mockResolvedValue(mockOrderItem),
    findOne: jest.fn().mockResolvedValue(mockOrderItem),
    metadata: {
      target: 'OrderItem',
      primaryColumns: [{ propertyName: 'id' }],
    },
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockOrderItem]),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
    }),
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockOrderItem),
      save: jest.fn().mockResolvedValue(mockOrderItem),
      create: jest.fn().mockReturnValue(mockOrderItem),
      metadata: {
        target: 'OrderItem',
        primaryColumns: [{ propertyName: 'id' }],
      },
    }),
  } as unknown as jest.Mocked<Repository<OrderItem>>;

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockOrderItem),
      save: jest.fn().mockResolvedValue(mockOrderItem),
      create: jest.fn().mockReturnValue(mockOrderItem),
      metadata: {
        target: 'OrderItem',
        primaryColumns: [{ propertyName: 'id' }],
      },
    }),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderItemsRepository,
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<OrderItemsRepository>(OrderItemsRepository);

    jest
      .spyOn(OrderItemDTO, 'fromEntity')
      .mockImplementation((entity: OrderItem) => {
        return {
          id: entity.id,
          product: entity.product,
          order: entity.order,
          quantity: entity.quantity,
          price: entity.price,
        } as OrderItemDTO;
      });

    jest
      .spyOn(OrderItemDTO, 'toEntity')
      .mockImplementation((dto: OrderItemDTO) => {
        return {
          id: dto.id,
          product: dto.product,
          order: dto.order,
          quantity: dto.quantity,
          price: dto.price,
        } as OrderItem;
      });
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Create Order Item', () => {
    it('should create an order item', async () => {
      const result = await repository.createOrderItem(mockOrderItem);

      expect(result).toEqual(expect.objectContaining(mockOrderItem));
    });

    it('should create an order item with a transaction manager', async () => {
      const result = await repository.createOrderItem(
        mockOrderItem,
        mockEntityManager,
      );

      expect(result).toEqual(expect.objectContaining(mockOrderItem));
    });

    it('should throw an error if the order item creation fails', async () => {
      mockOrmRepository.save.mockRejectedValue(
        CustomException.fromErrorEnum(Errors.E_0032_ORDER_ITEM_CREATION_ERROR),
      );

      await expect(repository.createOrderItem(mockOrderItem)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Find Order Items By Order ID', () => {
    it('should find order items by order ID', async () => {
      const result = await repository.findOrderItemsByOrderId(mockOrder.id);

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockOrderItem)]),
      );
    });

    it('should throw an error if the order items are not found', async () => {
      (
        mockOrmRepository.createQueryBuilder().getMany as jest.Mock
      ).mockResolvedValue([]);

      const result = await repository.findOrderItemsByOrderId(mockOrder.id);
      expect(result).toEqual([]);
    });
  });

  describe('Find Order Item By ID', () => {
    it('should find an order item by ID', async () => {
      const result = await repository.findOrderItemById(mockOrderItem.id);

      expect(result).toEqual(expect.objectContaining(mockOrderItem));
    });

    it('should throw an error if the order item is not found', async () => {
      mockOrmRepository.findOne.mockResolvedValue(undefined);

      await expect(
        repository.findOrderItemById(mockOrderItem.id),
      ).rejects.toThrow(CustomException);
    });
  });
});
