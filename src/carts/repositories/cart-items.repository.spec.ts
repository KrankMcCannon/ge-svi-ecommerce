import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { EntityManager } from 'typeorm';
import { CartItem } from '../entities/cartItem.entity';
import { CartItemsRepository } from './cart-items.repository';

describe('CartItemsRepository', () => {
  let repository: CartItemsRepository;

  const mockUser = {
    id: '1',
    email: 'ex@mple.com',
    password: 'password',
    name: 'name',
    role: 'user',
    cart: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCartItem = {
    id: '1',
    cart: null,
    product: null,
    quantity: 1,
  };

  const mockOrmRepository = {
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    save: jest.fn().mockResolvedValue(mockCartItem),
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
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

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
    expect(result).toEqual([mockCartItem]);
  });

  it('should find a cart item by ID', async () => {
    (
      mockEntityManager.getRepository(CartItem).findOne as jest.Mock
    ).mockResolvedValue(mockCartItem);

    const result = await repository.findCartItemById(
      mockCartItem.id,
      mockEntityManager,
    );
    expect(result).toEqual(mockCartItem);
  });

  it('throw custom exception if cart item is not found', async () => {
    (
      mockEntityManager.getRepository(CartItem).findOne as jest.Mock
    ).mockResolvedValue(null);

    await expect(
      repository.findCartItemById('2', mockEntityManager),
    ).rejects.toThrow();
  });

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

  it('should save a cart item', async () => {
    (
      mockEntityManager.getRepository(CartItem).save as jest.Mock
    ).mockResolvedValue(mockCartItem);

    const result = await repository.saveCartItem(
      mockCartItem,
      mockEntityManager,
    );
    expect(result).toEqual(mockCartItem);
  });

  it('should save a cart item without a manager', async () => {
    const result = await repository.saveCartItem(mockCartItem);
    expect(result).toEqual(mockCartItem);
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
