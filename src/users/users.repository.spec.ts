import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto, UpdateUserDto, UserDTO } from './dtos';
import { User } from './entities';
import { UserRepository } from './users.repository';
import { CartDTO } from 'src/carts/dtos';

describe('UsersRepository', () => {
  let repository: UserRepository;
  let ormRepository: jest.Mocked<Repository<User>>;

  const mockUser: UserDTO = {
    id: '1',
    name: 'Test User',
    email: 'ex@mple.com',
    role: 'user',
    cart: null,
    orders: [],
  };

  const mockCart: CartDTO = {
    id: '1',
    cartItems: [],
    userId: mockUser.id,
  };

  mockUser.cart = mockCart;

  const updateUserDto: UpdateUserDto = {
    name: 'Updated User',
    email: 'update@test.com',
    role: 'admin',
  };

  const mockUpdateUser: UserDTO = {
    id: '1',
    name: 'Updated User',
    email: 'update@test.com',
    role: 'admin',
    cart: mockCart,
    orders: [],
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
    afterEach(() => {
      ormRepository.findOne.mockResolvedValue(mockUser as User);
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
      ormRepository.findOne.mockRejectedValue(new Error('Some Error'));

      await expect(repository.findByEmail(mockUser.email)).rejects.toThrow();
    });
  });

  describe('Find User By ID', () => {
    afterEach(() => {
      ormRepository.findOne.mockResolvedValue(mockUser as User);
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
      ormRepository.findOne.mockRejectedValue(new Error('Some Error'));

      await expect(repository.findById(mockUser.id)).rejects.toThrow();
    });
  });

  describe('Create User', () => {
    afterEach(() => {
      ormRepository.save.mockResolvedValue(mockUser as User);
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

      ormRepository.save.mockRejectedValue(new Error('Some Error'));

      await expect(repository.createUser(createUserDto)).rejects.toThrow();
    });
  });

  describe('Update User', () => {
    afterEach(() => {
      ormRepository.update.mockResolvedValue(
        mockUpdateUser as unknown as UpdateResult,
      );
      ormRepository.findOne.mockResolvedValue(mockUser as User);
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
      ormRepository.update.mockRejectedValue(new Error('Some Error'));

      await expect(
        repository.updateUser(mockUser, updateUserDto),
      ).rejects.toThrow();
    });
  });

  describe('Delete User', () => {
    afterEach(() => {
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
      ormRepository.delete.mockRejectedValue(new Error('Some Error'));

      await expect(repository.deleteUser(mockUser.id)).rejects.toThrow();
    });

    it('should throw an error if user is not found', async () => {
      ormRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(repository.deleteUser(mockUser.id)).rejects.toThrow();
    });
  });

  describe('Save User', () => {
    afterEach(() => {
      ormRepository.save.mockResolvedValue(mockUser as User);
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
      ormRepository.save.mockRejectedValue(new Error('Some Error'));

      await expect(repository.saveUser(mockUser)).rejects.toThrow();
    });
  });
});
