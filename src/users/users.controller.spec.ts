import { Test, TestingModule } from '@nestjs/testing';
import { CartDTO, CartItemDTO } from 'src/carts/dtos';
import { StandardResponse } from 'src/config/standard-response.dto';
import { ProductDTO } from 'src/products/dtos/product.dto';
import { UpdateUserDto } from 'src/users/dtos';
import { CreateUserDto } from './dtos';
import { UserDTO } from './dtos/user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('CartsController', () => {
  let controller: UsersController;

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

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'ex@mple.com',
        password: 'password',
        name: 'name',
        role: 'user',
      };
      const result = await controller.create(createUserDto);
      expect(result).toEqual(new StandardResponse(mockUser));
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const result = await controller.findOne(mockUser.id);
      expect(result).toEqual(new StandardResponse(mockUser));
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'test@example.com',
      };
      const result = await controller.update(mockUser.id, updateUserDto);
      expect(result).toEqual(new StandardResponse(mockUser));
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const result = await controller.delete(mockUser.id);
      expect(result).toEqual(new StandardResponse(true));
    });
  });
});
