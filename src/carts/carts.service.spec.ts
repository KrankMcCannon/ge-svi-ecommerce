import { Test, TestingModule } from '@nestjs/testing';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { ProductDTO } from 'src/products/dtos/product.dto';
import { ProductsService } from 'src/products/products.service';
import { UserDTO } from 'src/users/dtos/user.dto';
import { UsersService } from 'src/users/users.service';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { CartsService } from './carts.service';
import { AddCartItemToCartDto, CartItemDTO } from './dtos';
import { CartDTO } from './dtos/cart.dto';
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
    findCart: jest.fn().mockResolvedValue(mockCart),
  };

  const mockCartItemsRepository = {
    findCartItemByCartIdAndProductId: jest.fn().mockResolvedValue(mockCartItem),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Add Product To Cart', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should add a product to the cart', async () => {
      const dto: AddCartItemToCartDto = {
        productId: '1',
        quantity: 2,
      };

      const result = await service.addProductToCart(mockUser.id, dto);

      expect(result).toEqual(expect.objectContaining(mockCart));
    });

    it('should throw an error if insufficient stock', async () => {
      const dto: AddCartItemToCartDto = {
        productId: '1',
        quantity: 20,
      };

      await expect(service.addProductToCart(mockUser.id, dto)).rejects.toThrow(
        CustomException,
      );
    });

    it('should handle errors and rollback transaction', async () => {
      const dto: AddCartItemToCartDto = {
        productId: '1',
        quantity: 20,
      };
      mockProductService.findProductById.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0009_PRODUCT_NOT_FOUND),
      );

      await expect(service.addProductToCart(mockUser.id, dto)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('findCartItems', () => {
    it('should return cart items', async () => {
      const pagination = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
      });

      const result = await service.findCartItems(mockUser.id, pagination);

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockCartItem)]),
      );
    });
  });

  describe('removeProductFromCart', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should remove an item from the cart', async () => {
      const result = await service.removeProductFromCart(
        mockUser.id,
        mockCartItem.id,
        mockProduct.id,
      );

      expect(result).toBeUndefined();
    });

    it('should handle errors and rollback transaction', async () => {
      mockCartItemsRepository.findCartItemByCartIdAndProductId.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND),
      );

      await expect(
        service.removeProductFromCart(
          mockUser.id,
          mockCartItem.id,
          mockProduct.id,
        ),
      ).rejects.toThrow(CustomException);
    });
  });
});
