import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { CreateUserDto, UpdateUserDto, UserWithPasswordDTO } from './dtos';
import { UserDTO } from './dtos/user.dto';
import { User } from './entities';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockUser: UserDTO = {
    id: '1',
    email: 'ex@mple.com',
    name: 'Test User',
    role: 'user',
    cart: null,
    orders: [],
  };

  const mockUpdateUser: UserDTO = {
    ...mockUser,
    name: 'Updated User',
  };

  const createUserDto: CreateUserDto = {
    email: 'ex@mple.com',
    password: 'password',
    name: 'Test User',
    role: 'user',
  };

  const updateUserDto: UpdateUserDto = {
    email: 'ex@mple.com',
    password: 'newpassword',
    name: 'Updated User',
  };

  const mockUserRepository = {
    createUser: jest.fn().mockResolvedValue(mockUser),
    findByEmail: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockResolvedValue(mockUser),
    updateUser: jest.fn().mockResolvedValue(mockUpdateUser),
    deleteUser: jest.fn().mockResolvedValue(undefined),
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
  } as unknown as jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.spyOn(UserDTO, 'fromEntity').mockImplementation((entity: UserDTO) => {
      return {
        id: entity.id,
        email: entity.email,
        name: entity.name,
        role: entity.role,
        cart: entity.cart,
        orders: entity.orders,
      } as UserDTO;
    });

    jest
      .spyOn(UserWithPasswordDTO, 'fromEntity')
      .mockImplementation((entity: User) => {
        return {
          id: entity.id,
          name: entity.name,
          email: entity.email,
          role: entity.role,
          cart: entity.cart,
          orders: entity.orders,
          password: entity.password,
        } as UserWithPasswordDTO;
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create User', () => {
    beforeEach(() => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
    });
    afterEach(() => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    });

    it('should create a new user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      const result = await service.create(createUserDto);

      expect(result).toEqual(expect.objectContaining(mockUser));
    });

    it('should throw an error if user already exists', async () => {
      mockUserRepository.findByEmail.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0026_DUPLICATE_USER),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Find User By Email', () => {
    beforeEach(() => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    });
    it('should return a user by email', async () => {
      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(expect.objectContaining(mockUser));
    });

    it('should return null if no user is found', async () => {
      mockUserRepository.findByEmail.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0025_USER_NOT_FOUND),
      );

      await expect(service.findByEmail(mockUser.email)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Find User By ID', () => {
    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
    });

    it('should return a user by id', async () => {
      const result = await service.findById(mockUser.id);

      expect(result).toEqual(expect.objectContaining(mockUser));
    });

    it('should return a user by id with a transaction manager', async () => {
      const result = await service.findById(mockUser.id, mockEntityManager);

      expect(result).toEqual(expect.objectContaining(mockUser));
    });

    it('should return null if no user is found', async () => {
      mockUserRepository.findById.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0025_USER_NOT_FOUND),
      );

      await expect(service.findById(mockUser.email)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Update User', () => {
    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.updateUser.mockResolvedValue(mockUpdateUser);
    });

    it('should update a user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');
      const result = await service.update(mockUser.id, updateUserDto);

      expect(result).toEqual(expect.objectContaining(mockUpdateUser));
    });

    it('should rollback transaction if update fails', async () => {
      mockUserRepository.updateUser.mockRejectedValueOnce(
        new Error('Update failed'),
      );

      await expect(
        service.update(mockUser.id, updateUserDto),
      ).rejects.toThrow();
    });
  });

  describe('Delete User', () => {
    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
    });

    it('should delete a user', async () => {
      const result = await service.delete(mockUser.id);

      expect(result).toBeUndefined();
    });

    it('should rollback transaction if delete fails', async () => {
      mockUserRepository.deleteUser.mockRejectedValueOnce(
        new Error('Delete failed'),
      );

      await expect(service.delete(mockUser.id)).rejects.toThrow();
    });
  });
});
