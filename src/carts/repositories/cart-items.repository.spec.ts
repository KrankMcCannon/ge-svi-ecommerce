import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { Product } from 'src/products/entities';
import { User } from 'src/users/entities';
import { EntityManager } from 'typeorm';
import { CartItemDTO } from '../dtos/cart-item.dto';
import { Cart } from '../entities';
import { CartItem } from '../entities/cartItem.entity';
import { CartItemsRepository } from './cart-items.repository';

describe('CartItemsRepository', () => {
  let repository: CartItemsRepository;

  const mockUser: User = {
    id: '1',
    email: 'ex@mple.com',
    name: 'name',
    role: 'user',
    cart: null,
    orders: [],
    createdAt: new Date(),
    updatedAt: null,
    password: 'password',
  };

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

  mockUser.cart = mockCart;
  mockProduct.cartItems.push(mockCartItem);
  mockCart.cartItems.push(mockCartItem);

  const mockOrmRepository = {
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    save: jest.fn().mockResolvedValue(mockCartItem),
    findOne: jest.fn().mockResolvedValue(mockCartItem),
    create: jest.fn().mockReturnValue(mockCartItem),
    createQueryBuilder: jest.fn(() => ({
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockCartItem]),
      orderBy: jest.fn().mockReturnThis(),
    })),
    metadata: {
      target: 'CartItem',
      primaryColumns: [{ propertyName: 'id' }],
    },
  };

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockCartItem),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      save: jest.fn().mockResolvedValue(mockCartItem),
      metadata: {
        target: 'CartItem',
        primaryColumns: [{ propertyName: 'id' }],
      },
      createQueryBuilder: jest.fn(() => ({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCartItem]),
      })),
    }),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartItemsRepository,
        {
          provide: getRepositoryToken(CartItem),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<CartItemsRepository>(CartItemsRepository);

    jest
      .spyOn(CartItemDTO, 'fromEntity')
      .mockImplementation((entity: CartItem) => {
        return {
          id: entity.id,
          quantity: entity.quantity,
          cart: entity.cart,
          product: entity.product,
          price: entity.price,
        } as CartItemDTO;
      });

    jest
      .spyOn(CartItemDTO, 'toEntity')
      .mockImplementation((dto: CartItemDTO) => {
        return {
          id: dto.id,
          quantity: dto.quantity,
          cart: dto.cart,
          product: dto.product,
          price: dto.price,
        } as CartItem;
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createCartItem', () => {
    it('should create a new cart item', async () => {
      const result = await repository.createCartItem(mockCart, mockProduct, 2);

      expect(result).toEqual(expect.objectContaining(mockCartItem));
    });

    it('should throw CustomException when creation fails', async () => {
      mockOrmRepository.save.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0012_CART_ADD_ERROR),
      );

      await expect(
        repository.createCartItem(mockCart, mockProduct, 2),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('findCartItems', () => {
    it('should retrieve all cart items for a cart ID', async () => {
      const query = {
        pagination: new PaginationInfo(),
        filter: 'name',
      };
      const result = await repository.findCartItems(
        mockCart.id,
        mockEntityManager,
        query,
      );

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockCartItem)]),
      );
    });
  });

  describe('findCartItemById', () => {
    it('should find a cart item by ID', async () => {
      const result = await repository.findCartItemById(mockCartItem.id);

      expect(result).toEqual(expect.objectContaining(mockCartItem));
    });

    it('should throw an exception if cart item is not found', async () => {
      mockOrmRepository.findOne.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND),
      );
      await expect(repository.findCartItemById('invalid-id')).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Remove Cart Item', () => {
    it('should remove a cart item', async () => {
      (
        mockEntityManager.getRepository(CartItem).delete as jest.Mock
      ).mockResolvedValue({ affected: 1 });

      await repository.removeCartItem(mockCartItem.id, mockEntityManager);
    });

    it('should remove a cart item without a manager', async () => {
      await repository.removeCartItem(mockCartItem.id);
    });

    it('should throw custom exception if cart item is not found', async () => {
      (
        mockEntityManager.getRepository(CartItem).delete as jest.Mock
      ).mockResolvedValue({ affected: 0 });

      await expect(
        repository.removeCartItem('2', mockEntityManager),
      ).rejects.toThrow();
    });
  });

  describe('Save Cart Item', () => {
    it('should save a cart item', async () => {
      (
        mockEntityManager.getRepository(CartItem).save as jest.Mock
      ).mockResolvedValue(mockCartItem);

      const result = await repository.saveCartItem(
        mockCartItem,
        mockEntityManager,
      );
      expect(result).toEqual(expect.objectContaining(mockCartItem));
    });

    it('should save a cart item without a manager', async () => {
      const result = await repository.saveCartItem(mockCartItem);
      expect(result).toEqual(expect.objectContaining(mockCartItem));
    });

    it('should throw custom exception if save fails', async () => {
      (
        mockEntityManager.getRepository(CartItem).save as jest.Mock
      ).mockRejectedValue(new Error('Save error'));

      await expect(
        repository.saveCartItem(mockCartItem, mockEntityManager),
      ).rejects.toThrow();
    });
  });
});
