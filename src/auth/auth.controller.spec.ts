import { Test, TestingModule } from '@nestjs/testing';
import { StandardResponse } from 'src/config/standard-response.dto';
import { UserDTO } from 'src/users/dtos/user.dto';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn().mockResolvedValue({ access_token: 'token' }),
  };

  const mockUser: UserDTO = {
    id: '1',
    email: 'ex@mple.com',
    name: 'name',
    role: 'user',
    cart: null,
    orders: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const req = { user: mockUser };
      const result = await controller.login(req);
      expect(result).toEqual(new StandardResponse({ access_token: 'token' }));
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });
});
