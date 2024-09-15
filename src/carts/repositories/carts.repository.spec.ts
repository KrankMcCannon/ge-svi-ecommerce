import { Test, TestingModule } from '@nestjs/testing';
import { CartRepository } from './cart.repository';
import { Cart } from '../../products/entities/cart.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AddToCartDto } from '../dtos/add-cart-item-to-cart.dto';
import { Product } from '../../products/entities/product.entity';
import { PaginationInfo } from 'src/config/pagination-info.dto';

describe('CartRepository', () => {
  let repository: CartRepository;
  let ormRepository: jest.Mocked<Repository<Cart>>;

  const mockProduct: Product = {
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

  const mockCartItem: Cart = {
    id: '1',
    product: mockProduct,
    quantity: 2,
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
        CartRepository,
        {
          provide: getRepositoryToken(Cart),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<CartRepository>(CartRepository);
    ormRepository = module.get<Repository<Cart>>(
      getRepositoryToken(Cart),
    ) as jest.Mocked<Repository<Cart>>;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addToCart', () => {
    it('should add an item to the cart', async () => {
      const addToCartDto: AddToCartDto = {
        productId: '1',
        quantity: 2,
      };

      const result = await repository.addToCart(
        addToCartDto,
        mockProduct,
        mockEntityManager,
      );

      console.log(result);
      expect(result).toEqual(mockCartItem);
    });
  });

  describe('findCart', () => {
    it('should return a list of cart items', async () => {
      ormRepository.find.mockResolvedValue([mockCartItem]);

      const cartId = '1';
      const query = {};
      const paginationInfo = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
        paginationEnabled: true,
      });

      const result = await repository.findCart(cartId, query, paginationInfo);

      expect(result).toEqual([mockCartItem]);
    });
  });

  describe('findOneById', () => {
    it('should return a cart item by id', async () => {
      const result = await repository.findOneById('1', mockEntityManager);

      expect(result).toEqual(mockCartItem);
    });
  });

  describe('removeCartItem', () => {
    it('should remove a cart item', async () => {
      const result = await repository.removeCartItem('1', mockEntityManager);

      expect(result).toBeUndefined();
    });
  });
});
