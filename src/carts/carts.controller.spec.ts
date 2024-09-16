import { Test, TestingModule } from '@nestjs/testing';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { StandardList } from 'src/config/standard-list.dto';
import { StandardResponse } from 'src/config/standard-response.dto';
import { ProductDTO } from 'src/products/dtos/product.dto';
import { UserDTO } from 'src/users/dtos/user.dto';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { AddCartItemToCartDto, CartDTO, CartItemDTO } from './dtos';

describe('CartsController', () => {
  let controller: CartsController;

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
    price: 100,
    stock: 10,
  };

  const mockCart: CartDTO = {
    id: '1',
    userId: mockUser.id,
    cartItems: [],
  };

  const mockCartItem: CartItemDTO = {
    id: '1',
    quantity: 2,
    product: mockProduct,
    cartId: mockCart.id,
  };

  mockUser.cart = mockCart;
  mockCart.cartItems.push(mockCartItem);

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

  describe('Add Cart Item to Cart', () => {
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

  describe('Find Cart Items from Cart', () => {
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

  describe('Remove Cart Item from Cart', () => {
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
