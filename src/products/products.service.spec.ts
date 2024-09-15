import { Test, TestingModule } from '@nestjs/testing';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import {
  AddToCartDto,
  CreateCommentDto,
  CreateProductDto,
  UpdateProductDto,
} from './dtos';
import { Cart, Comment, Product } from './entities';
import { ProductsService } from './products.service';
import { CartRepository } from '../carts/repositories/cart.repository';
import { CommentRepository } from './repositories/comments.repository';
import { ProductsRepository } from './repositories/products.repository';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: jest.Mocked<ProductsRepository>;
  let cartRepository: jest.Mocked<CartRepository>;
  let commentRepository: jest.Mocked<CommentRepository>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let entityManager: jest.Mocked<EntityManager>;

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

  const mockUpdatedProduct: Product = {
    ...mockProduct,
    name: 'Updated Product',
  };

  const mockCart: Cart = {
    id: '1',
    product: mockProduct,
    quantity: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockComment: Comment = {
    id: '1',
    content: 'Great product!',
    author: 'John Doe',
    product: mockProduct,
    createdAt: new Date(),
    updatedAt: new Date(),
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

  const mockCartRepository = {
    addToCart: jest.fn().mockResolvedValue(mockCart),
    findCart: jest.fn().mockResolvedValue([mockCart]),
    findOneById: jest.fn().mockResolvedValue(mockCart),
    removeCartItem: jest.fn().mockResolvedValue(undefined),
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
        { provide: CartRepository, useValue: mockCartRepository },
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productsRepository = module.get(ProductsRepository);
    cartRepository = module.get(CartRepository);
    commentRepository = module.get(CommentRepository);
    queryRunner = mockQueryRunner;
    entityManager = mockEntityManager;
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      expect(productsRepository.findByName).toHaveBeenCalledWith(dto.name);
      expect(productsRepository.createProduct).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if product exists', async () => {
      productsRepository.findByName.mockResolvedValueOnce(mockProduct);
      const dto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
      };
      await expect(service.createProduct(dto)).rejects.toThrow(CustomException);
      expect(productsRepository.findByName).toHaveBeenCalledWith(dto.name);
      expect(productsRepository.createProduct).not.toHaveBeenCalled();
    });
  });

  describe('findAllProducts', () => {
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

      expect(result).toEqual([mockProduct]);
      expect(productsRepository.findAll).toHaveBeenCalledWith(
        { sort, ...filter },
        paginationInfo,
      );
    });
  });

  describe('findProductById', () => {
    it('should return a product by id', async () => {
      const result = await service.findProductById('1');
      expect(result).toEqual(mockProduct);
      expect(productsRepository.findOneById).toHaveBeenCalledWith('1');
    });

    it('should throw an error if id is invalid', async () => {
      await expect(service.findProductById('')).rejects.toThrow(
        CustomException,
      );
      expect(productsRepository.findOneById).not.toHaveBeenCalled();
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
      expect(productsRepository.findOneById).toHaveBeenCalledWith('2');
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const dto: UpdateProductDto = {
        name: 'Updated Product',
      };
      const result = await service.updateProduct('1', dto);
      expect(result).toEqual(mockUpdatedProduct);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(productsRepository.updateProduct).toHaveBeenCalledWith(
        '1',
        dto,
        entityManager,
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should handle errors and rollback transaction', async () => {
      const dto: UpdateProductDto = {
        name: 'Updated Product',
      };
      productsRepository.updateProduct.mockRejectedValueOnce(
        new Error('Update failed'),
      );

      await expect(service.updateProduct('1', dto)).rejects.toThrow(
        CustomException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('removeProduct', () => {
    it('should remove a product', async () => {
      const result = await service.removeProduct('1');
      expect(result).toBeUndefined();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(productsRepository.removeProduct).toHaveBeenCalledWith(
        '1',
        entityManager,
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should handle errors and rollback transaction', async () => {
      productsRepository.removeProduct.mockRejectedValueOnce(
        new Error('Remove failed'),
      );

      await expect(service.removeProduct('1')).rejects.toThrow(CustomException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('addToCart', () => {
    it('should add a product to the cart', async () => {
      const dto: AddToCartDto = {
        productId: '1',
        quantity: 2,
      };

      productsRepository.findOneById.mockResolvedValueOnce(mockProduct);
      const result = await service.addToCart(dto);

      expect(result).toEqual(mockCart);
      expect(productsRepository.findOneById).toHaveBeenCalledWith(
        dto.productId,
        entityManager,
      );
      expect(productsRepository.saveProduct).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 8 }),
        entityManager,
      );
      expect(cartRepository.addToCart).toHaveBeenCalledWith(
        dto,
        mockProduct,
        entityManager,
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw an error if insufficient stock', async () => {
      const dto: AddToCartDto = {
        productId: '1',
        quantity: 20,
      };
      productsRepository.findOneById.mockResolvedValueOnce(mockProduct);

      await expect(service.addToCart(dto)).rejects.toThrow(CustomException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should handle errors and rollback transaction', async () => {
      const dto: AddToCartDto = {
        productId: '1',
        quantity: 2,
      };
      productsRepository.findOneById.mockRejectedValueOnce(
        new Error('Find failed'),
      );

      await expect(service.addToCart(dto)).rejects.toThrow(CustomException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findCart', () => {
    it('should return cart items', async () => {
      const paginationInfo = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
      });
      const sort = 'product.name';
      const filter = { productName: 'Test' };

      const result = await service.findCart('1', paginationInfo, sort, filter);

      expect(result).toEqual([mockCart]);
      expect(cartRepository.findCart).toHaveBeenCalledWith(
        '1',
        { sort, ...filter },
        paginationInfo,
      );
    });
  });

  describe('removeFromCart', () => {
    it('should remove an item from the cart', async () => {
      cartRepository.findOneById.mockResolvedValueOnce(mockCart);
      productsRepository.findOneById.mockResolvedValueOnce(mockProduct);

      const result = await service.removeFromCart('1');

      expect(result).toBeUndefined();
      expect(cartRepository.findOneById).toHaveBeenCalledWith(
        '1',
        entityManager,
      );
      expect(productsRepository.saveProduct).toHaveBeenCalledWith(
        expect.objectContaining(mockCart.product),
        entityManager,
      );
      expect(cartRepository.removeCartItem).toHaveBeenCalledWith(
        '1',
        entityManager,
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should handle errors and rollback transaction', async () => {
      cartRepository.findOneById.mockRejectedValueOnce(
        new Error('Find failed'),
      );

      await expect(service.removeFromCart('1')).rejects.toThrow(
        CustomException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('addComment', () => {
    it('should add a comment to a product', async () => {
      const dto: CreateCommentDto = {
        productId: '1',
        content: 'Great product!',
        author: 'John Doe',
      };
      productsRepository.findOneById.mockResolvedValueOnce(mockProduct);

      const result = await service.addComment(dto);

      expect(result).toEqual(mockComment);
      expect(productsRepository.findOneById).toHaveBeenCalledWith(
        dto.productId,
      );
      expect(commentRepository.addComment).toHaveBeenCalledWith(
        dto,
        mockProduct,
      );
    });

    it('should throw an error if product not found', async () => {
      productsRepository.findOneById.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0009_PRODUCT_NOT_FOUND, {
          data: { id: '3' },
        }),
      );
      const dto: CreateCommentDto = {
        productId: '2',
        content: 'Great product!',
        author: 'John Doe',
      };

      await expect(service.addComment(dto)).rejects.toThrow(CustomException);
      expect(productsRepository.findOneById).toHaveBeenCalledWith(
        dto.productId,
      );
      expect(commentRepository.addComment).not.toHaveBeenCalled();
    });
  });

  describe('findAllComments', () => {
    it('should return a list of comments for a product', async () => {
      const productId = '1';
      const paginationInfo = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
      });

      const result = await service.findAllComments(productId, paginationInfo);

      expect(result).toEqual([mockComment]);
      expect(commentRepository.findAllComments).toHaveBeenCalledWith(
        productId,
        paginationInfo,
      );
    });
  });
});
