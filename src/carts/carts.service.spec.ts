import { Test, TestingModule } from '@nestjs/testing';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { ProductDTO } from 'src/products/dtos/product.dto';
import { Product } from 'src/products/entities';
import { ProductsService } from 'src/products/products.service';
import { UserDTO } from 'src/users/dtos/user.dto';
import { User } from 'src/users/entities';
import { UsersService } from 'src/users/users.service';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { CartsService } from './carts.service';
import { AddCartItemToCartDto, CartItemDTO } from './dtos';
import { CartDTO } from './dtos/cart.dto';
import { CartItem } from './entities';
import { CartItemsRepository } from './repositories/cart-items.repository';
import { CartsRepository } from './repositories/carts.repository';

describe('CartsService', () => {
  let service: CartsService;

  const mockUser: UserDTO = {
    id: '1',
    email: 'ex@mple.com',
    name: 'name',
    role: 'user',
    orders: [],
    cart: null,
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
  mockProduct.cartItems.push(mockCartItem);
  mockCart.cartItems.push(mockCartItem);

  const mockUserService = {
    findById: jest.fn().mockResolvedValue(mockUser),
  };

  const mockProductService = {
    findProductById: jest.fn().mockResolvedValue(mockProduct),
    saveProduct: jest.fn().mockResolvedValue(mockProduct),
  };

  const mockCartRepository = {
    addToCart: jest.fn().mockResolvedValue(mockCart),
    findCartById: jest.fn().mockResolvedValue(mockCart),
    findCartByUserId: jest.fn().mockResolvedValue(mockCart),
    deleteCart: jest.fn().mockResolvedValue(undefined),
    clearCart: jest.fn().mockResolvedValue(undefined),
    saveCart: jest.fn().mockResolvedValue(mockCart),
  };

  const mockCartItemsRepository = {
    findCartItemByCartIdAndProductId: jest.fn().mockResolvedValue(mockCartItem),
    findCartItemById: jest.fn().mockResolvedValue(mockCartItem),
    findCartItems: jest.fn().mockResolvedValue([mockCartItem]),
    saveCartItem: jest.fn().mockResolvedValue(mockCartItem),
    removeCartItem: jest.fn().mockResolvedValue(undefined),
  };

  const mockEntityManager = {
    getRepository: jest.fn(),
  } as unknown as jest.Mocked<EntityManager>;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: mockEntityManager,
  } as unknown as jest.Mocked<QueryRunner>;

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  } as unknown as DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        { provide: CartsRepository, useValue: mockCartRepository },
        { provide: CartItemsRepository, useValue: mockCartItemsRepository },
        { provide: UsersService, useValue: mockUserService },
        { provide: ProductsService, useValue: mockProductService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);

    jest.spyOn(UserDTO, 'toEntity').mockImplementation((dto: UserDTO) => {
      return {
        id: dto.id,
        email: dto.email,
        name: dto.name,
        role: dto.role,
        orders: dto.orders,
        cart: dto.cart,
      } as User;
    });

    jest
      .spyOn(ProductDTO, 'fromEntity')
      .mockImplementation((entity: Product) => {
        return {
          id: entity.id,
          name: entity.name,
          description: entity.description,
          price: entity.price,
          stock: entity.stock,
          cartItems: entity.cartItems,
          comments: entity.comments,
          orderItems: entity.orderItems,
        } as ProductDTO;
      });

    jest
      .spyOn(CartItemDTO, 'fromEntity')
      .mockImplementation((entity: CartItem) => {
        return {
          id: entity.id,
          product: entity.product,
          cart: entity.cart,
          quantity: entity.quantity,
          price: entity.price,
        } as CartItemDTO;
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCartOrAddToCart', () => {
    it('should add a product to the cart', async () => {
      const dto: AddCartItemToCartDto = {
        productId: '1',
        quantity: 2,
      };

      const result = await service.createCartOrAddToCart(mockUser.id, dto);

      expect(result).toEqual(expect.objectContaining(mockCart));
    });

    it('should throw an error if there is insufficient stock', async () => {
      const dto: AddCartItemToCartDto = {
        productId: '1',
        quantity: 20,
      };

      await expect(
        service.createCartOrAddToCart(mockUser.id, dto),
      ).rejects.toThrow(CustomException);
    });

    it('should handle errors and rollback transaction', async () => {
      const dto: AddCartItemToCartDto = {
        productId: '1',
        quantity: 20,
      };

      mockProductService.findProductById.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0010_INSUFFICIENT_STOCK, {
          data: {
            stock: 1,
          },
          originalError: new Error('Insufficient stock'),
        }),
      );

      await expect(
        service.createCartOrAddToCart(mockUser.id, dto),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('findCartItems', () => {
    it('should return cart items', async () => {
      const pagination = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
      });

      const result = await service.findCartItems(mockCart.id, { pagination });

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockCartItem)]),
      );
    });
  });

  describe('removeItemFromCart', () => {
    it('should remove a cart item', async () => {
      const result = await service.removeItemFromCart(
        mockCart.id,
        mockCartItem.id,
      );

      expect(result).toBeUndefined();
    });

    it('should handle errors during cart item removal and rollback transaction', async () => {
      mockCartItemsRepository.findCartItemById.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND, {
          data: {
            cartItemId: 'invalid-cart-item-id',
          },
          originalError: new Error('Cart item not found'),
        }),
      );

      await expect(
        service.removeItemFromCart(mockCart.id, 'invalid-cart-item-id'),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('deleteCart', () => {
    it('should delete the cart', async () => {
      const result = await service.deleteCart(mockCart.id);
      expect(result).toBeUndefined();
    });
  });

  describe('clearCart', () => {
    it('should clear all items in the cart', async () => {
      const result = await service.clearCart(mockCart.id);
      expect(result).toBeUndefined();
    });
  });
});
