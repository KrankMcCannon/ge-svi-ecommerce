import { Test, TestingModule } from '@nestjs/testing';
import { CartRepository } from './cart.repository';
import { Cart } from '../entities/cart.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AddToCartDto } from '../dtos/add-to-cart.dto';
import { Product } from '../entities/product.entity';
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
  };

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
      const manager: Partial<EntityManager> = {
        save: jest.fn().mockResolvedValue(mockCartItem),
      };

      const addToCartDto: AddToCartDto = {
        productId: '1',
        quantity: 2,
      };

      const result = await repository.addToCart(
        addToCartDto,
        mockProduct,
        manager as EntityManager,
      );

      expect(manager.save).toHaveBeenCalled();
      expect(result).toEqual(mockCartItem);
    });
  });

  describe('findCart', () => {
    it('should return a list of cart items', async () => {
      ormRepository.find.mockResolvedValue([mockCartItem]);

      const paginationInfo = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
        paginationEnabled: true,
      });

      const result = await repository.findCart(paginationInfo);

      expect(ormRepository.find).toHaveBeenCalledWith({
        relations: ['product'],
      });
      expect(result).toEqual([mockCartItem]);
    });
  });

  describe('findOneById', () => {
    it('should return a cart item by id', async () => {
      const manager: Partial<EntityManager> = {
        save: jest.fn().mockResolvedValue(mockCartItem),
      };

      const result = await repository.findOneById(
        '1',
        manager as EntityManager,
      );

      expect(manager.findOne).toHaveBeenCalledWith(Cart, {
        where: { id: '1' },
        relations: ['product'],
      });
      expect(result).toEqual(mockCartItem);
    });
  });

  describe('removeCartItem', () => {
    it('should remove a cart item', async () => {
      const manager: Partial<EntityManager> = {
        save: jest.fn().mockResolvedValue(mockCartItem),
      };

      const result = await repository.removeCartItem(
        '1',
        manager as EntityManager,
      );

      expect(manager.delete).toHaveBeenCalledWith(Cart, '1');
      expect(result).toEqual({ affected: 1 });
    });
  });
});
