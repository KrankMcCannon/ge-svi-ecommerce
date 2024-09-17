import { Test, TestingModule } from '@nestjs/testing';
import { CustomException } from 'src/config/custom-exception';
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
  let cartsRepository: jest.Mocked<CartsRepository>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let entityManager: jest.Mocked<EntityManager>;

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
    userId: mockUser.id,
  };

  const mockCartItem: CartItemDTO = {
    id: '1',
    productId: mockProduct.id,
    quantity: 2,
    cartId: mockCart.id,
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
    findCartItems: jest.fn().mockResolvedValue([mockCartItem]),
    findCartItemById: jest.fn().mockResolvedValue(mockCartItem),
    saveCartItem: jest.fn().mockResolvedValue(mockCartItem),
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
    cartsRepository = module.get(CartsRepository);
    queryRunner = mockQueryRunner;
    entityManager = mockEntityManager;
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

      expect(result).toEqual(mockCart);
      expect(mockProductService.findProductById).toHaveBeenCalledWith(
        dto.productId,
        entityManager,
      );
      expect(mockProductService.saveProduct).toHaveBeenCalledWith(
        mockProduct,
        entityManager,
      );
      expect(cartsRepository.addToCart).toHaveBeenCalledWith(
        mockUser.id,
        mockProduct,
        dto.quantity,
        entityManager,
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw an error if insufficient stock', async () => {
      const dto: AddCartItemToCartDto = {
        productId: '1',
        quantity: 20,
      };

      await expect(service.addProductToCart(mockUser.id, dto)).rejects.toThrow(
        CustomException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should handle errors and rollback transaction', async () => {
      const dto: AddCartItemToCartDto = {
        productId: '1',
        quantity: 20,
      };
      mockProductService.findProductById.mockRejectedValueOnce(
        new Error('Find failed'),
      );

      await expect(service.addProductToCart(mockUser.id, dto)).rejects.toThrow(
        CustomException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findCartItems', () => {
    it('should return cart items', async () => {
      const pagination = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
      });

      const result = await service.findCartItems(mockUser.id, pagination);

      expect(result).toEqual([mockCartItem]);
      expect(mockCartItemsRepository.findCartItems).toHaveBeenCalledWith(
        mockUser.id,
        pagination,
        { sort: undefined },
      );
    });
  });

  describe('removeProductFromCart', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should remove an item from the cart', async () => {
      await service.removeProductFromCart(
        mockUser.id,
        mockCartItem.id,
        mockProduct.id,
      );

      expect(mockCartRepository.findCart).toHaveBeenCalledWith(
        mockUser.id,
        entityManager,
      );
      expect(mockCartItemsRepository.findCartItemById).toHaveBeenCalledWith(
        mockCartItem.id,
        entityManager,
      );
      expect(mockProductService.findProductById).toHaveBeenCalledWith(
        mockProduct.id,
        entityManager,
      );
      expect(mockCartItemsRepository.saveCartItem).toHaveBeenCalledWith(
        mockCartItem,
        entityManager,
      );
      expect(mockProductService.saveProduct).toHaveBeenCalledWith(
        mockProduct,
        entityManager,
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should handle errors and rollback transaction', async () => {
      mockCartItemsRepository.findCartItemById.mockRejectedValueOnce(
        new Error('Find failed'),
      );

      await expect(
        service.removeProductFromCart(
          mockUser.id,
          mockCartItem.id,
          mockProduct.id,
        ),
      ).rejects.toThrow(CustomException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
