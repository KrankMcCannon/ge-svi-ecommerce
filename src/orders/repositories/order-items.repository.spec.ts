import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartDTO, CartItemDTO } from 'src/carts/dtos';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { ProductDTO } from 'src/products/dtos';
import { UserDTO } from 'src/users/dtos';
import { EntityManager, Repository } from 'typeorm';
import { OrderDTO, OrderItemDTO } from '../dtos';
import { OrderItem } from '../entities';
import { OrderStatus } from '../enum';
import { OrderItemsRepository } from './order-items.repository';

describe('OrderItemsRepository', () => {
  let repository: OrderItemsRepository;

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
    cartItems: [],
    user: mockUser,
  };

  const mockCartItem: CartItemDTO = {
    id: '1',
    product: mockProduct,
    cart: mockCart,
    quantity: 2,
    price: 100,
  };

  const mockOrder: OrderDTO = {
    id: '1',
    user: mockUser,
    status: OrderStatus.PENDING,
    orderItems: [],
  };

  const mockOrderItem: OrderItemDTO = {
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
    find: jest.fn().mockResolvedValue([mockOrderItem]),
    metadata: {
      target: 'OrderItem',
      primaryColumns: [{ propertyName: 'id' }],
    },
  } as unknown as jest.Mocked<Repository<OrderItem>>;

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockOrderItem),
      save: jest.fn().mockResolvedValue(mockOrderItem),
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
      mockOrmRepository.find.mockResolvedValue([]);

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
