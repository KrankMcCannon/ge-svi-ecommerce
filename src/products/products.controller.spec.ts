import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { CreateCommentDto, CreateProductDto, UpdateProductDto } from './dtos';
import { CommentDTO } from './dtos/comment.dto';
import { ProductDTO } from './dtos/product.dto';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { StandardResponse } from 'src/config/standard-response.dto';
import { StandardList } from 'src/config/standard-list.dto';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProduct: ProductDTO = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
  };

  const mockUpdateProduct: ProductDTO = {
    id: '1',
    name: 'Updated Product',
    description: 'Updated Description',
    price: 200,
    stock: 20,
  };

  const mockComment: CommentDTO = {
    id: '1',
    content: 'Great product!',
    author: 'Test User',
    product: mockProduct,
  };

  const mockProductsService = {
    createProduct: jest.fn().mockResolvedValue(mockProduct),
    findAllProducts: jest.fn().mockResolvedValue([mockProduct]),
    findProductById: jest.fn().mockResolvedValue(mockProduct),
    updateProduct: jest.fn().mockResolvedValue(mockUpdateProduct),
    removeProduct: jest.fn().mockResolvedValue(undefined),
    addComment: jest.fn().mockResolvedValue(mockComment),
    findAllComments: jest.fn().mockResolvedValue([mockComment]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService],
    })
      .overrideProvider(ProductsService)
      .useValue(mockProductsService)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create Product', () => {
    const dto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
    };

    it('should create a product', async () => {
      const result = await controller.create(dto);

      expect(result).toEqual(new StandardResponse(mockProduct));
    });

    it('should throw an error when service fails', async () => {
      mockProductsService.createProduct.mockRejectedValue(
        new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
      );

      await expect(controller.create(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('Find All Products', () => {
    const paginationInfo = new PaginationInfo({ pageNumber: 0, pageSize: 10 });

    it('should return a list of products', async () => {
      const result = await controller.findAll(paginationInfo);

      expect(result).toEqual(
        new StandardList([mockProduct], 1, paginationInfo),
      );
    });

    it('should handle empty product list', async () => {
      mockProductsService.findAllProducts.mockResolvedValue([]);

      const result = await controller.findAll(paginationInfo);

      expect(result).toEqual(new StandardList([], 0, paginationInfo));
    });

    it('should throw an error when service fails', async () => {
      mockProductsService.findAllProducts.mockRejectedValue(
        new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      await expect(controller.findAll(paginationInfo)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('Find Product By ID', () => {
    it('should return a product by ID', async () => {
      const result = await controller.findOne(mockProduct.id);

      expect(result).toEqual(new StandardResponse(mockProduct));
    });

    it('should throw an error when product not found', async () => {
      mockProductsService.findProductById.mockRejectedValue(
        new HttpException('Not Found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.findOne(mockProduct.id)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('Update Product', () => {
    const dto: UpdateProductDto = {
      name: 'Updated Product',
      description: 'Updated Description',
      price: 200,
      stock: 20,
    };
    it('should update a product', async () => {
      const result = await controller.update(mockProduct.id, dto);

      expect(result).toEqual(new StandardResponse(mockUpdateProduct));
    });

    it('should throw an error when update fails', async () => {
      mockProductsService.updateProduct.mockRejectedValue(
        new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
      );

      await expect(controller.update(mockProduct.id, dto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('Delete Product', () => {
    it('should remove a product', async () => {
      const result = await controller.remove(mockProduct.id);

      expect(result).toEqual(new StandardResponse(true));
    });

    it('should throw an error when removal fails', async () => {
      mockProductsService.removeProduct.mockRejectedValue(
        new HttpException('Not Found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.remove(mockProduct.id)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('Add Comment to Product', () => {
    const dto: CreateCommentDto = {
      productId: '1',
      content: 'Great product!',
      author: 'Test User',
    };

    it('should add a comment to a product', async () => {
      const result = await controller.addComment(dto);

      expect(result).toEqual(new StandardResponse(mockComment));
    });

    it('should throw an error when adding comment fails', async () => {
      mockProductsService.addComment.mockRejectedValue(
        new HttpException('Product Not Found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.addComment(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('Find All Comments', () => {
    const paginationInfo = new PaginationInfo({ pageNumber: 0, pageSize: 10 });

    it('should return a list of comments for a product', async () => {
      const result = await controller.findAllComments(
        mockProduct.id,
        paginationInfo,
      );

      expect(result).toEqual(
        new StandardList([mockComment], 1, paginationInfo),
      );
    });

    it('should handle no comments for a product', async () => {
      mockProductsService.findAllComments.mockResolvedValue([]);

      const result = await controller.findAllComments(
        mockProduct.id,
        paginationInfo,
      );

      expect(result).toEqual(new StandardList([], 0, paginationInfo));
    });

    it('should throw an error when retrieving comments fails', async () => {
      mockProductsService.findAllComments.mockRejectedValue(
        new HttpException('Product Not Found', HttpStatus.NOT_FOUND),
      );

      await expect(
        controller.findAllComments(mockProduct.id, paginationInfo),
      ).rejects.toThrow(HttpException);
    });
  });
});
