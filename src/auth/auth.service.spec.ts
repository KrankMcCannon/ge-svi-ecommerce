import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { CustomException } from 'src/config/custom-exception';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const user = {
    id: '1',
    email: 'ex@mple.com',
    password: 'password',
    name: 'name',
    role: 'user',
    cart: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findByEmail: jest.fn().mockResolvedValue(user),
    validatePassword: jest.fn().mockResolvedValue(true),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should throw CustomException if email is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('test@example.com', 'wrongPassword'),
      ).rejects.toThrow(CustomException);
    });

    it('should throw CustomException if password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('ex@mple.com', 'wrongPassword'),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const result = await service.login(user);
      expect(result).toEqual({ access_token: 'token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        role: user.role,
        sub: user.id,
      });
    });
  });
});
