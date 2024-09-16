import { Test, TestingModule } from '@nestjs/testing';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import {
  CommentDTO,
  CreateCommentDto,
  CreateProductDto,
  ProductDTO,
  UpdateProductDto,
} from './dtos';
import { Product } from './entities';
import { ProductsService } from './products.service';
import { CommentRepository } from './repositories/comments.repository';
import { ProductsRepository } from './repositories/products.repository';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: jest.Mocked<ProductsRepository>;

  const mockProduct: ProductDTO = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
  };

  const mockUpdatedProduct: ProductDTO = {
    ...mockProduct,
    name: 'Updated Product',
  };

  const mockComment: CommentDTO = {
    id: '1',
    content: 'Great product!',
    author: 'John Doe',
    product: mockProduct,
  };

  const mockProductsRepository = {
    createProduct: jest.fn().mockResolvedValue(mockProduct),
    findByName: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([mockProduct]),
    findOneById: jest.fn().mockResolvedValue(mockProduct),
    updateProduct: jest.fn().mockResolvedValue(mockUpdatedProduct),
    removeProduct: jest.fn().mockResolvedValue(undefined),
    saveProduct: jest.fn().mockResolvedValue(mockProduct),
  };

  const mockCommentRepository = {
    addComment: jest.fn().mockResolvedValue(mockComment),
    findAllComments: jest.fn().mockResolvedValue([mockComment]),
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
  } as unknown as DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: mockProductsRepository },
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productsRepository = module.get(ProductsRepository);

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Product', () => {
    const dto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
    };
    it('should create a product', async () => {
      const result = await service.createProduct(dto);
      expect(result).toEqual(expect.objectContaining(mockProduct));
    });

    it('should throw an error if product exists', async () => {
      productsRepository.findByName.mockResolvedValueOnce(mockProduct);
      await expect(service.createProduct(dto)).rejects.toThrow(CustomException);
    });
  });

  describe('Find All Products', () => {
    it('should return a list of products', async () => {
      const paginationInfo = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
      });
      const sort = 'name';
      const filter = { category: 'Electronics' };

      const result = await service.findAllProducts(
        paginationInfo,
        sort,
        filter,
      );

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockProduct)]),
      );
    });
  });

  describe('Find Product By ID', () => {
    it('should return a product by id', async () => {
      const result = await service.findProductById(mockProduct.id);
      expect(result).toEqual(expect.objectContaining(mockProduct));
    });

    it('should throw an error if id is invalid', async () => {
      await expect(service.findProductById('')).rejects.toThrow(
        CustomException,
      );
    });

    it('should throw an error if product not found', async () => {
      productsRepository.findOneById.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0009_PRODUCT_NOT_FOUND, {
          data: { id: '2' },
        }),
      );
      await expect(service.findProductById('2')).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Update Product', () => {
    const dto: UpdateProductDto = {
      name: 'Updated Product',
    };
    it('should update a product', async () => {
      const result = await service.updateProduct(mockProduct.id, dto);
      expect(result).toEqual(expect.objectContaining(mockUpdatedProduct));
    });

    it('should handle errors and rollback transaction', async () => {
      productsRepository.updateProduct.mockRejectedValueOnce(
        new Error('Update failed'),
      );

      await expect(service.updateProduct(mockProduct.id, dto)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Delete Product', () => {
    it('should remove a product', async () => {
      const result = await service.removeProduct(mockProduct.id);
      expect(result).toBeUndefined();
    });

    it('should handle errors and rollback transaction', async () => {
      productsRepository.removeProduct.mockRejectedValueOnce(
        new Error('Remove failed'),
      );

      await expect(service.removeProduct(mockProduct.id)).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('Add Comment to Product', () => {
    const dto: CreateCommentDto = {
      productId: '1',
      content: 'Great product!',
      author: 'John Doe',
    };
    it('should add a comment to a product', async () => {
      const result = await service.addComment(dto);

      expect(result).toEqual(expect.objectContaining(mockComment));
    });

    it('should throw an error if product not found', async () => {
      productsRepository.findOneById.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0009_PRODUCT_NOT_FOUND, {
          data: { id: '2' },
        }),
      );

      await expect(service.addComment(dto)).rejects.toThrow(CustomException);
    });
  });

  describe('Find All Comments', () => {
    it('should return a list of comments for a product', async () => {
      const productId = '1';
      const paginationInfo = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
      });

      const result = await service.findAllComments(productId, paginationInfo);

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockComment)]),
      );
    });
  });
});
