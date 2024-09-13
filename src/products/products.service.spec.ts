/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { CartRepository } from './repositories/cart.repository';
import { CommentRepository } from './repositories/comment.repository';
import { DataSource } from 'typeorm';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: jest.Mocked<ProductsRepository>;
  let cartRepository: jest.Mocked<CartRepository>;
  let commentRepository: jest.Mocked<CommentRepository>;
  let dataSource: DataSource;

  const mockProduct = {
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

  const mockCartRepository = {
    addToCart: jest.fn().mockResolvedValue({}),
  };

  const mockCommentRepository = {
    addComment: jest.fn().mockResolvedValue({}),
  };

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue(mockCartRepository),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: mockEntityManager,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: mockProductsRepository },
        { provide: CartRepository, useValue: mockCartRepository },
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productsRepository = module.get<ProductsRepository>(
      ProductsRepository,
    ) as jest.Mocked<ProductsRepository>;
    cartRepository = module.get<CartRepository>(
      CartRepository,
    ) as jest.Mocked<CartRepository>;
    commentRepository = module.get<CommentRepository>(
      CommentRepository,
    ) as jest.Mocked<CommentRepository>;
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const dto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
      };
      const result = await service.createProduct(dto);
      expect(result).toEqual(mockProduct);
      expect(productsRepository.findByName).toHaveBeenCalledWith(dto.name);
      expect(productsRepository.createProduct).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if product exists', async () => {
      productsRepository.findByName.mockResolvedValue(mockProduct);
      const dto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
      };
      await expect(service.createProduct(dto)).rejects.toThrow();
    });
  });
});
