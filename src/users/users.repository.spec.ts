import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from 'src/carts/entities';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { DeleteResult, EntityManager, Repository, UpdateResult } from 'typeorm';
import {
  CreateUserDto,
  UpdateUserDto,
  UserDTO,
  UserWithPasswordDTO,
} from './dtos';
import { User } from './entities';
import { UserRepository } from './users.repository';

describe('UsersRepository', () => {
  let repository: UserRepository;
  let ormRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'ex@mple.com',
    role: 'user',
    cart: null,
    orders: [],
    createdAt: new Date(),
    updatedAt: null,
    password: 'password',
  };

  const mockCart: Cart = {
    id: '1',
    cartItems: [],
    user: mockUser,
    createdAt: new Date(),
    updatedAt: null,
  };

  mockUser.cart = mockCart;

  const updateUserDto: UpdateUserDto = {
    name: 'Updated User',
    email: 'update@test.com',
    role: 'admin',
  };

  const mockUpdateUser: User = {
    ...mockUser,
    name: 'Updated User',
    email: 'update@test.com',
  };

  const mockOrmRepository = {
    create: jest.fn().mockReturnValue(mockUser),
    findOne: jest.fn().mockResolvedValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUpdateUser),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockUser]),
    })),
    metadata: {
      target: 'User',
      primaryColumns: [{ propertyName: 'id' }],
    },
  } as unknown as jest.Mocked<Repository<User>>;

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      update: jest.fn().mockResolvedValue(mockUpdateUser),
      metadata: {
        target: 'User',
        primaryColumns: [{ propertyName: 'id' }],
      },
      createQueryBuilder: jest.fn(() => ({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
      })),
    }),
  } as unknown as jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    ormRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;

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
        };
      });

    jest.spyOn(UserDTO, 'fromEntity').mockImplementation((entity: User) => {
      return {
        id: entity.id,
        name: entity.name,
        email: entity.email,
        role: entity.role,
        cart: entity.cart,
        orders: entity.orders,
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Find User By Email', () => {
    beforeEach(() => {
      ormRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should find a user by email', async () => {
      const result = await repository.findByEmail(mockUser.email);

      expect(result).toEqual(expect.objectContaining(mockUser));
    });

    it('should return null if user is not found', async () => {
      ormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail(mockUser.email);

      expect(result).toBeNull();
    });

    it('should throw an error if an error occurs', async () => {
      ormRepository.findOne.mockRejectedValue(
        CustomException.fromErrorEnum(Errors.E_0025_USER_NOT_FOUND),
      );

      await expect(repository.findByEmail(mockUser.email)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Find User By ID', () => {
    beforeEach(() => {
      ormRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should find a user by ID', async () => {
      const result = await repository.findById(mockUser.id);

      expect(result).toEqual(expect.objectContaining(mockUser));
    });

    it('should find a user by ID with a transaction manager', async () => {
      const result = await repository.findById(mockUser.id, mockEntityManager);

      expect(result).toEqual(expect.objectContaining(mockUser));
    });

    it('should throw an error if an error occurs', async () => {
      ormRepository.findOne.mockRejectedValue(
        CustomException.fromErrorEnum(Errors.E_0025_USER_NOT_FOUND),
      );

      await expect(repository.findById(mockUser.id)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Create User', () => {
    beforeEach(() => {
      ormRepository.save.mockResolvedValue(mockUser);
    });

    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@user.com',
        name: 'Test User',
        role: 'user',
        password: 'password',
      };

      const result = await repository.createUser(createUserDto);

      expect(result).toEqual(expect.objectContaining(mockUser));
    });

    it('should throw an error if an error occurs', async () => {
      const createUserDto: CreateUserDto = {
        email: 'error@user.com',
        name: 'Error User',
        role: 'user',
        password: 'password',
      };

      ormRepository.save.mockRejectedValue(
        CustomException.fromErrorEnum(Errors.E_0022_USER_CREATION_ERROR),
      );

      await expect(repository.createUser(createUserDto)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Update User', () => {
    beforeEach(() => {
      ormRepository.update.mockResolvedValue(
        mockUpdateUser as unknown as UpdateResult,
      );
      ormRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should update a user', async () => {
      ormRepository.findOne.mockResolvedValue(mockUpdateUser as User);

      const result = await repository.updateUser(mockUser, updateUserDto);

      expect(result).toEqual(expect.objectContaining(mockUpdateUser));
    });

    it('should update a user with a transaction manager', async () => {
      (
        mockEntityManager.getRepository(User).findOne as jest.Mock
      ).mockResolvedValue(mockUpdateUser);

      const result = await repository.updateUser(
        mockUser,
        updateUserDto,
        mockEntityManager,
      );

      expect(result).toEqual(expect.objectContaining(mockUpdateUser));
    });

    it('should throw an error if an error occurs', async () => {
      ormRepository.update.mockRejectedValue(
        CustomException.fromErrorEnum(Errors.E_0023_USER_UPDATE_ERROR),
      );

      await expect(
        repository.updateUser(mockUser, updateUserDto),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('Delete User', () => {
    beforeEach(() => {
      ormRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);
    });

    it('should delete a user', async () => {
      const result = await repository.deleteUser(mockUser.id);

      expect(result).toBeUndefined();
    });

    it('should delete a user with a transaction manager', async () => {
      const result = await repository.deleteUser(
        mockUser.id,
        mockEntityManager,
      );

      expect(result).toBeUndefined();
    });

    it('should throw an error if an error occurs', async () => {
      ormRepository.delete.mockRejectedValue(
        CustomException.fromErrorEnum(Errors.E_0024_USER_REMOVE_ERROR),
      );

      await expect(repository.deleteUser(mockUser.id)).rejects.toThrow();
    });

    it('should throw an error if user is not found', async () => {
      ormRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(repository.deleteUser(mockUser.id)).rejects.toThrow();
    });
  });

  describe('Save User', () => {
    beforeEach(() => {
      ormRepository.save.mockResolvedValue(mockUser);
    });

    it('should save a user', async () => {
      const result = await repository.saveUser(mockUser);

      expect(result).toEqual(expect.objectContaining(mockUser));
    });

    it('should save a user with a transaction manager', async () => {
      const result = await repository.saveUser(mockUser, mockEntityManager);

      expect(result).toEqual(expect.objectContaining(mockUser));
    });

    it('should throw an error if an error occurs', async () => {
      ormRepository.save.mockRejectedValue(
        CustomException.fromErrorEnum(Errors.E_0022_USER_CREATION_ERROR),
      );

      await expect(repository.saveUser(mockUser)).rejects.toThrow(
        CustomException,
      );
    });
  });
});
