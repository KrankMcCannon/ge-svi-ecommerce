import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { CustomException } from 'src/config/custom-exception';
import { EmailProducerService } from 'src/email/email-producer.service';
import { UserDTO } from 'src/users/dtos/user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: UserDTO = {
    id: '1',
    email: 'ex@mple.com',
    name: 'name',
    role: 'user',
    cart: null,
    orders: [],
  };

  const mockUsersService = {
    findByEmail: jest.fn().mockResolvedValue(mockUser),
    validatePassword: jest.fn().mockResolvedValue(true),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('token'),
  };

  const mockEmailProducerService = {
    sendEmailTask: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailProducerService, useValue: mockEmailProducerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
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
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('ex@mple.com', 'wrongPassword'),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const result = await service.login(mockUser);
      expect(result).toEqual({ access_token: 'token' });
    });
  });
});
