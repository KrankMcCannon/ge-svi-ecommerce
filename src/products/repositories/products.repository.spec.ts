import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { EntityManager, Repository } from 'typeorm';
import { CreateProductDto, ProductDTO, UpdateProductDto } from '../dtos';
import { Product } from '../entities/product.entity';
import { ProductsRepository } from './products.repository';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let ormRepository: jest.Mocked<Repository<Product>>;

  const mockProduct: ProductDTO = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
  };

  const updateProductDto: UpdateProductDto = {
    name: 'Updated Product',
    description: 'Updated Description',
    price: 150,
    stock: 20,
  };

  const mockOrmRepository = {
    create: jest.fn().mockReturnValue(mockProduct),
    findOne: jest.fn().mockResolvedValue(mockProduct),
    save: jest.fn().mockResolvedValue(mockProduct),
    update: jest.fn().mockResolvedValue(updateProductDto),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockProduct]),
    })),
    metadata: {
      target: 'Cart',
      primaryColumns: [{ propertyName: 'id' }],
    },
  };

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockProduct),
      save: jest.fn().mockResolvedValue(mockProduct),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      update: jest.fn().mockResolvedValue(updateProductDto),
      metadata: {
        target: 'Cart',
        primaryColumns: [{ propertyName: 'id' }],
      },
      createQueryBuilder: jest.fn(() => ({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockProduct),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
      })),
    }),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsRepository,
        {
          provide: getRepositoryToken(Product),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<ProductsRepository>(ProductsRepository);
    ormRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    ) as jest.Mocked<Repository<Product>>;

    jest
      .spyOn(ProductDTO, 'fromEntity')
      .mockImplementation((entity: Product) => {
        return {
          id: entity.id,
          name: entity.name,
          description: entity.description,
          price: entity.price,
          stock: entity.stock,
        } as ProductDTO;
      });

    jest
      .spyOn(ProductDTO, 'toEntity')
      .mockImplementation((product: ProductDTO) => {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
        } as Product;
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Create Product', () => {
    it('should create and return a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
      };

      const result = await repository.createProduct(createProductDto);

      expect(result).toEqual(expect.objectContaining(mockProduct));
    });

    it('should throw an error if save fails', async () => {
      ormRepository.save.mockRejectedValue(new Error('Save error'));

      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
      };

      await expect(repository.createProduct(createProductDto)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('Find All Products', () => {
    it('should return an array of products using EntityManager', async () => {
      const query = { name: 'Test' };
      const paginationInfo = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
        paginationEnabled: true,
      });

      const result = await repository.findAll(query, paginationInfo);

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockProduct)]),
      );
    });

    it('should throw an error if the query fails', async () => {
      ormRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Query error');
      });
      const query = { name: 'Test' };
      const paginationInfo = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
        paginationEnabled: true,
      });

      await expect(repository.findAll(query, paginationInfo)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('Find Product By ID', () => {
    it('should return a product if found', async () => {
      (
        mockEntityManager.getRepository(Product).findOne as jest.Mock
      ).mockResolvedValue(mockProduct);

      const result = await repository.findOneById('1', mockEntityManager);

      expect(result).toEqual(expect.objectContaining(mockProduct));
    });

    it('should throw an error if not found', async () => {
      (
        mockEntityManager.getRepository(Product).findOne as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        repository.findOneById('1', mockEntityManager),
      ).rejects.toThrow(
        CustomException.fromErrorEnum(Errors.E_0009_PRODUCT_NOT_FOUND),
      );
    });
  });

  describe('Find Product By Name', () => {
    it('should return a product if found by name', async () => {
      const result = await repository.findByName('Test Product');

      expect(result).toEqual(expect.objectContaining(mockProduct));
    });

    it('should return null if no product is found by name', async () => {
      ormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByName('Nonexistent Product');

      expect(result).toBeNull();
    });
  });

  describe('Update Product', () => {
    it('should update and return a product', async () => {
      (
        mockEntityManager.getRepository(Product).findOne as jest.Mock
      ).mockResolvedValue(updateProductDto);

      const result = await repository.updateProduct(
        '1',
        updateProductDto,
        mockEntityManager,
      );

      expect(result).toEqual(expect.objectContaining(updateProductDto));
    });

    it('should throw an error if the update fails', async () => {
      (
        mockEntityManager.getRepository(Product).update as jest.Mock
      ).mockRejectedValue(new Error('Update error'));

      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150,
        stock: 20,
      };

      await expect(
        repository.updateProduct('1', updateProductDto, mockEntityManager),
      ).rejects.toThrow(Error);
    });
  });

  describe('Delete Product', () => {
    it('should remove a product', async () => {
      (
        mockEntityManager.getRepository(Product).findOne as jest.Mock
      ).mockResolvedValue(mockProduct);
      (
        mockEntityManager.getRepository(Product).createQueryBuilder as jest.Mock
      ).mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });
      (
        mockEntityManager.getRepository(Product).delete as jest.Mock
      ).mockResolvedValue({ affected: 1 });

      const result = await repository.removeProduct('1', mockEntityManager);

      expect(result).toBeUndefined();
    });

    it('should throw an error if the product is associated with other records', async () => {
      (
        mockEntityManager.getRepository(Product).findOne as jest.Mock
      ).mockResolvedValue(mockProduct);
      (
        mockEntityManager.getRepository(Product).createQueryBuilder as jest.Mock
      ).mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockProduct),
      });
      (
        mockEntityManager.getRepository(Product).delete as jest.Mock
      ).mockRejectedValueOnce(new Error('Delete error'));

      await expect(
        repository.removeProduct('1', mockEntityManager),
      ).rejects.toThrow(
        CustomException.fromErrorEnum(Errors.E_0008_PRODUCT_REMOVE_ERROR),
      );
    });

    it('should throw an error if the deletion fails', async () => {
      (
        mockEntityManager.getRepository(Product).findOne as jest.Mock
      ).mockResolvedValue(mockProduct);
      (
        mockEntityManager.getRepository(Product).createQueryBuilder as jest.Mock
      ).mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });
      (
        mockEntityManager.getRepository(Product).delete as jest.Mock
      ).mockRejectedValue(new Error('Delete error'));

      await expect(
        repository.removeProduct('1', mockEntityManager),
      ).rejects.toThrow(Error);
    });
  });

  describe('Save Product', () => {
    it('should save and return the product', async () => {
      const result = await repository.saveProduct(
        mockProduct,
        mockEntityManager,
      );

      expect(result).toEqual(expect.objectContaining(mockProduct));
    });

    it('should throw an error if save fails', async () => {
      (
        mockEntityManager.getRepository(Product).save as jest.Mock
      ).mockRejectedValue(new Error('Save error'));

      await expect(
        repository.saveProduct(mockProduct, mockEntityManager),
      ).rejects.toThrow(Error);
    });
  });
});
