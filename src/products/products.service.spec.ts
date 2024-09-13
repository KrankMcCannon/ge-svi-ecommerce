import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto } from './dtos';
import { Product } from './entities';
import { DataSource } from 'typeorm';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<ProductsRepository>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
    cartItems: [],
  };

  const mockProductsRepository = {
    createProduct: jest.fn().mockResolvedValue(mockProduct),
    findByName: jest.fn().mockResolvedValue(null),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {},
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, ProductsRepository, DataSource],
    })
      .overrideProvider(ProductsRepository)
      .useValue(mockProductsRepository)
      .overrideProvider(DataSource)
      .useValue(mockDataSource)
      .compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<ProductsRepository>(
      ProductsRepository,
    ) as jest.Mocked<ProductsRepository>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
      };

      const result = await service.createProduct(dto);
      expect(result).toEqual(mockProduct);
      expect(repository.findByName).toHaveBeenCalledWith(dto.name);
      expect(repository.createProduct).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if product exists', async () => {
      repository.findByName.mockResolvedValue(mockProduct);

      const dto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
      };

      await expect(service.createProduct(dto)).rejects.toThrow();
    });
  });
});
