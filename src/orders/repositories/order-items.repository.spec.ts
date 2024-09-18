import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartDTO, CartItemDTO } from 'src/carts/dtos';
import { CartItem } from 'src/carts/entities';
import { ProductDTO } from 'src/products/dtos';
import { UserDTO } from 'src/users/dtos';
import { OrderDTO, OrderItemDTO } from '../dtos';
import { Order, OrderItem } from '../entities';
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
  mockCart.cartItems.push(mockCartItem);
  mockOrder.orderItems.push(mockOrderItem);

  const mockOrmRepository = {
    create: jest.fn().mockReturnValue(mockOrderItem),
    save: jest.fn().mockResolvedValue(mockOrderItem),
  };

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
      .spyOn(CartItemDTO, 'toEntity')
      .mockImplementation((entity: CartItemDTO) => {
        return {
          id: entity.id,
          product: entity.product,
          cart: entity.cart,
          quantity: entity.quantity,
          price: entity.price,
        } as CartItem;
      });

    jest.spyOn(OrderDTO, 'toEntity').mockImplementation((entity: OrderDTO) => {
      return {
        id: entity.id,
        user: entity.user,
        orderItems: entity.orderItems,
        status: entity.status,
      } as Order;
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

    it('should throw an error if the order item creation fails', async () => {
      mockOrmRepository.save.mockRejectedValue(new Error('Some Error'));

      await expect(repository.createOrderItem(mockOrderItem)).rejects.toThrow(
        Error,
      );
    });
  });
});
