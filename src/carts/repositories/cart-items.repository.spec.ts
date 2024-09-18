import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { ProductDTO } from 'src/products/dtos';
import { UserDTO } from 'src/users/dtos/user.dto';
import { EntityManager } from 'typeorm';
import { CartDTO } from '../dtos';
import { CartItemDTO } from '../dtos/cart-item.dto';
import { CartItem } from '../entities/cartItem.entity';
import { CartItemsRepository } from './cart-items.repository';

describe('CartItemsRepository', () => {
  let repository: CartItemsRepository;

  const mockUser: UserDTO = {
    id: '1',
    email: 'ex@mple.com',
    name: 'name',
    role: 'user',
    cart: null,
    orders: [],
  };

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

  mockUser.cart = mockCart;
  mockCart.cartItems.push(mockCartItem);

  const mockOrmRepository = {
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    save: jest.fn().mockResolvedValue(mockCartItem),
    findOne: jest.fn().mockResolvedValue(mockCartItem),
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
      primaryColumns: [{ propertyName: 'id' }, { propertyName: 'sort' }],
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

  describe('Find Cart Items', () => {
    it('should find cart items', async () => {
      const query = {
        name: 'name',
        sort: 'sort',
      };
      const pagination = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
        paginationEnabled: true,
      });
      const result = await repository.findCartItems(
        mockUser.id,
        pagination,
        query,
      );
      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockCartItem)]),
      );
    });

    it('should find a cart item by ID', async () => {
      (
        mockEntityManager.getRepository(CartItem).findOne as jest.Mock
      ).mockResolvedValue(mockCartItem);

      const result = await repository.findCartItemById(
        mockCartItem.id,
        mockEntityManager,
      );
      expect(result).toEqual(expect.objectContaining(mockCartItem));
    });

    it('throw custom exception if cart item is not found', async () => {
      (
        mockEntityManager.getRepository(CartItem).findOne as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        repository.findCartItemById('2', mockEntityManager),
      ).rejects.toThrow();
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
