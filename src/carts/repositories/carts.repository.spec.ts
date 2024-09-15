import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AddCartItemToCartDto } from '../dtos';
import { Cart } from '../entities';
import { CartItem } from '../entities/cartItem.entity';
import { CartItemsRepository } from './cart-items.repository';
import { CartsRepository } from './carts.repository';

describe('CartRepository', () => {
  let repository: CartsRepository;
  let ormRepository: jest.Mocked<Repository<Cart>>;

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

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 50,
    stock: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    cartItems: [],
    comments: [],
  };

  const mockCartItem = {
    id: '1',
    user: null,
    cartItems: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrmRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockCartItem]),
    })),
    metadata: {
      target: 'Cart',
      primaryColumns: [{ propertyName: 'id' }],
    },
  };

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockCartItem),
      save: jest.fn().mockResolvedValue(mockCartItem),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      metadata: {
        target: 'Cart',
        primaryColumns: [{ propertyName: 'id' }],
      },
    }),
    transaction: jest.fn(),
    query: jest.fn(),
    save: jest.fn().mockResolvedValue(mockCartItem),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    findOne: jest.fn().mockResolvedValue(mockCartItem),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsRepository,
        {
          provide: getRepositoryToken(Cart),
          useValue: mockOrmRepository,
        },
        CartItemsRepository,
        {
          provide: getRepositoryToken(CartItem),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<CartsRepository>(CartsRepository);
    ormRepository = module.get<Repository<Cart>>(
      getRepositoryToken(Cart),
    ) as jest.Mocked<Repository<Cart>>;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addToCart', () => {
    it('should add an item to the cart', async () => {
      const AddCartItemToCartDto: AddCartItemToCartDto = {
        productId: '1',
        quantity: 2,
      };

      const result = await repository.addToCart(
        mockUser.id,
        AddCartItemToCartDto,
        mockProduct,
        mockEntityManager,
      );

      expect(result).toEqual(mockCartItem);
    });
  });

  describe('findCart', () => {
    it('should return a list of cart items', async () => {
      ormRepository.find.mockResolvedValue([mockCartItem]);

      const result = await repository.findCart(mockUser.id, mockEntityManager);

      expect(result).toEqual(mockCartItem);
    });
  });

  describe('removeCartItem', () => {
    it('should remove a cart item', async () => {
      const result = await repository.deleteCart('1', mockEntityManager);

      expect(result).toBeUndefined();
    });
  });
});
