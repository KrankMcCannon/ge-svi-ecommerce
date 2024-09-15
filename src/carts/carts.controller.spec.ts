import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { AddCartItemToCartDto } from './dtos';
import { StandardResponse } from 'src/config/standard-response.dto';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { StandardList } from 'src/config/standard-list.dto';

describe('CartsController', () => {
  let controller: CartsController;

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
    price: 100,
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    cartItems: [],
    comments: [],
  };

  const mockCartItem = {
    id: '1',
    product: mockProduct,
    quantity: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCart = {
    id: '1',
    cartItems: [mockCartItem],
    user: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCartsService = {
    addProductToCart: jest.fn().mockResolvedValue(mockCartItem),
    findCartItems: jest.fn().mockResolvedValue([mockCartItem]),
    removeProductFromCart: jest.fn().mockResolvedValue(mockCartItem),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [CartsService],
    })
      .overrideProvider(CartsService)
      .useValue(mockCartsService)
      .compile();

    controller = module.get<CartsController>(CartsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addToCart', () => {
    it('should return a cart', async () => {
      const addProductToCartDto: AddCartItemToCartDto = {
        productId: mockProduct.id,
        quantity: 2,
      };
      const req = { user: mockUser };
      const result = await controller.addToCart(addProductToCartDto, req);
      expect(result).toEqual(new StandardResponse(mockCartItem));
    });
  });

  describe('findCartItems', () => {
    it('should return a list of cart items', async () => {
      const req = { user: mockUser };
      const pagination = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
      });
      const result = await controller.findCartItems(req, pagination);
      expect(result).toEqual(new StandardList([mockCartItem], 1, pagination));
    });
  });

  describe('removeFromCart', () => {
    it('should return a cart item', async () => {
      const req = { user: mockUser };
      const body = {
        productId: mockProduct.id,
      };
      const result = await controller.removeFromCart(req, mockCart.id, body);
      expect(result).toEqual(new StandardResponse(true));
    });
  });
});
