import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductDTO } from 'src/products/dtos/product.dto';
import { ProductsRepository } from 'src/products/repositories/products.repository';
import { UserDTO } from 'src/users/dtos/user.dto';
import { EntityManager } from 'typeorm';
import { CartItemDTO } from '../dtos/cart-item.dto';
import { CartDTO } from '../dtos/cart.dto';
import { Cart } from '../entities';
import { CartItemsRepository } from './cart-items.repository';
import { CartsRepository } from './carts.repository';

describe('CartRepository', () => {
  let repository: CartsRepository;

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
    price: 50,
    stock: 100,
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
    quantity: 1,
    price: 50,
  };

  mockUser.cart = mockCart;
  mockCart.cartItems.push(mockCartItem);

  const mockOrmRepository = {
    create: jest.fn().mockResolvedValue(mockCart),
    save: jest.fn().mockResolvedValue(mockCart),
    findOne: jest.fn().mockResolvedValue(mockCart),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
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

  const mockCartItemsRepository = {
    findCartItemByCartIdAndProductId: jest.fn().mockResolvedValue(mockCartItem),
    saveCartItem: jest.fn().mockResolvedValue(mockCartItem),
    removeCartItem: jest.fn().mockResolvedValue(undefined),
  } as unknown as CartItemsRepository;

  const mockProductsRepository = {
    findOneById: jest.fn().mockResolvedValue(mockProduct),
    findProductById: jest.fn().mockResolvedValue(mockProduct),
    saveProduct: jest.fn().mockResolvedValue(mockProduct),
  } as unknown as ProductsRepository;

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockCart),
      save: jest.fn().mockResolvedValue(mockCart),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      metadata: {
        target: 'Cart',
        primaryColumns: [{ propertyName: 'id' }],
      },
    }),
    transaction: jest.fn(),
    query: jest.fn(),
    save: jest.fn().mockResolvedValue(mockCart),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    findOne: jest.fn().mockResolvedValue(mockCart),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsRepository,
        {
          provide: getRepositoryToken(Cart),
          useValue: mockOrmRepository,
        },
        { provide: CartItemsRepository, useValue: mockCartItemsRepository },
        { provide: ProductsRepository, useValue: mockProductsRepository },
      ],
    }).compile();

    repository = module.get<CartsRepository>(CartsRepository);

    jest.spyOn(CartDTO, 'fromEntity').mockImplementation((entity: Cart) => {
      return {
        id: entity.id,
        cartItems: entity.cartItems,
        user: entity.user,
      } as CartDTO;
    });

    jest.spyOn(CartDTO, 'toEntity').mockImplementation((dto: CartDTO) => {
      return {
        id: dto.id,
        cartItems: dto.cartItems,
        user: dto.user,
      } as Cart;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Add Cart Item to Cart', () => {
    it('should add an item to the cart', async () => {
      const result = await repository.addToCart(
        mockUser.id,
        mockProduct,
        2,
        mockEntityManager,
      );

      expect(result).toEqual(expect.objectContaining(mockCart));
    });
  });

  describe('Find Cart', () => {
    it('should return a list of cart items', async () => {
      const result = await repository.findCart(mockUser.id, mockEntityManager);

      expect(result).toEqual(expect.objectContaining(mockCart));
    });
  });

  describe('Remove Cart Item from Cart', () => {
    it('should remove a cart item', async () => {
      const result = await repository.deleteCart(
        mockCart.id,
        mockEntityManager,
      );

      expect(result).toBeUndefined();
    });
  });
});
