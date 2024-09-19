import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { Product } from 'src/products/entities';
import { ProductsRepository } from 'src/products/repositories/products.repository';
import { User } from 'src/users/entities';
import { EntityManager } from 'typeorm';
import { CartDTO } from '../dtos/cart.dto';
import { Cart, CartItem } from '../entities';
import { CartItemsRepository } from './cart-items.repository';
import { CartsRepository } from './carts.repository';

describe('CartRepository', () => {
  let repository: CartsRepository;

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
    price: 50,
    stock: 100,
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
    quantity: 1,
    price: 50,
  };

  mockUser.cart = mockCart;
  mockProduct.cartItems.push(mockCartItem);
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
    createCartItem: jest.fn().mockResolvedValue(mockCartItem),
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
      create: jest.fn().mockReturnValue(mockCart),
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
      mockCart.cartItems = [];
      const result = await repository.addToCart(mockUser, mockProduct, 1);

      expect(result).toEqual(expect.objectContaining(mockCart));
    });
  });

  describe('findCartByUserId', () => {
    it("should return a user's cart", async () => {
      mockCart.cartItems = [mockCartItem];
      const result = await repository.findCartByUserId(mockUser.id);

      expect(result).toEqual(expect.objectContaining(mockCart));
    });

    it('should return null if no cart is found', async () => {
      mockOrmRepository.findOne.mockResolvedValueOnce(null);

      const result = await repository.findCartByUserId('invalid-user-id');

      expect(result).toBeNull();
    });
  });

  describe('findCartById', () => {
    it('should return a cart by its ID', async () => {
      const result = await repository.findCartById(mockCart.id);

      expect(result).toEqual(expect.objectContaining(mockCart));
    });

    it('should return null if no cart is found by ID', async () => {
      mockOrmRepository.findOne.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND),
      );

      await expect(repository.findCartById('invalid-cart-id')).rejects.toThrow(
        CustomException,
      );
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

  describe('deleteCart', () => {
    it('should delete a cart and associated cart items', async () => {
      const result = await repository.deleteCart(
        mockCart.id,
        mockEntityManager,
      );
      expect(result).toBeUndefined();
    });

    it('should throw an error if the cart is not found', async () => {
      mockOrmRepository.findOne.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND),
      );

      await expect(repository.deleteCart('invalid-cart-id')).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('saveCart', () => {
    it('should save the cart', async () => {
      const result = await repository.saveCart(mockCart, mockEntityManager);

      expect(result).toEqual(expect.objectContaining(mockCart));
    });

    it('should throw an error if saving fails', async () => {
      mockOrmRepository.save.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0012_CART_ADD_ERROR),
      );

      await expect(repository.saveCart(mockCart)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('clearCart', () => {
    it('should clear all items from the cart', async () => {
      const result = await repository.clearCart(mockCart.id, mockEntityManager);
      expect(result).toBeUndefined();
    });

    it('should throw an error if clearing fails', async () => {
      mockOrmRepository.findOne.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND),
      );

      await expect(repository.clearCart('invalid-cart-id')).rejects.toThrow(
        CustomException,
      );
    });
  });
});
