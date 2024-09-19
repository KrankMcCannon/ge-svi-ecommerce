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

  const mockCartsService = {
    createCartOrAddToCart: jest.fn().mockResolvedValue(mockCart),
    findCartItems: jest.fn().mockResolvedValue([mockCartItem]),
    removeItemFromCart: jest.fn().mockResolvedValue(undefined),
    deleteCart: jest.fn().mockResolvedValue(undefined),
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

  describe('createCartOrAddToCart', () => {
    it('should add a product to the cart and return it', async () => {
      const addCartItemToCartDto: AddCartItemToCartDto = {
        productId: mockProduct.id,
        quantity: 2,
      };
      const req = { user: mockUser };
      const result = await controller.createCartOrAddToCart(
        addCartItemToCartDto,
        req,
      );

      expect(result).toEqual(new StandardResponse(mockCart));
    });
  });

  describe('findCartItems', () => {
    it('should return a list of cart items', async () => {
      const pagination = new PaginationInfo({ pageNumber: 1, pageSize: 10 });
      const result = await controller.findCartItems(mockCart.id, pagination);

      expect(result).toEqual(new StandardList([mockCartItem], 1, pagination));
    });
  });

  describe('removeItemFromCart', () => {
    it('should remove an item from the cart', async () => {
      const result = await controller.removeItemFromCart(
        { user: mockUser },
        mockCart.id,
        mockCartItem.id,
      );

      expect(result).toEqual(new StandardResponse(true));
    });
  });

  describe('deleteCart', () => {
    it('should delete a cart and return success', async () => {
      const result = await controller.deleteCart(mockCart.id);

      expect(result).toEqual(new StandardResponse(true));
    });
  });
});
