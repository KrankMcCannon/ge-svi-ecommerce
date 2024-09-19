import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { CommentDTO, ProductDTO } from '../dtos';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { Comment, Product } from '../entities';
import { CommentRepository } from './comments.repository';

describe('CommentRepository', () => {
  let repository: CommentRepository;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 50,
    stock: 100,
    cartItems: [],
    comments: [],
    orderItems: [],
    createdAt: new Date(),
    updatedAt: undefined,
  };

  const mockComment: Comment = {
    id: '1',
    content: 'Excellent product!',
    author: 'John Doe',
    product: mockProduct,
    createdAt: new Date(),
    updatedAt: undefined,
  };

  mockProduct.comments.push(mockComment);

  const mockOrmRepository = {
    create: jest.fn().mockReturnValue(mockComment),
    save: jest.fn().mockResolvedValue(mockComment),
    findOne: jest.fn().mockResolvedValue(mockComment),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockComment]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentRepository,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<CommentRepository>(CommentRepository);

    jest
      .spyOn(CommentDTO, 'fromEntity')
      .mockImplementation((entity: Comment) => {
        return {
          id: entity.id,
          content: entity.content,
          author: entity.author,
          product: entity.product,
        } as CommentDTO;
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
          orderItems: product.orderItems,
          comments: product.comments,
          cartItems: product.cartItems,
        } as Product;
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Add Comment to Product', () => {
    it('should add a comment to a product', async () => {
      const createCommentDto: CreateCommentDto = {
        productId: '1',
        content: 'Excellent product!',
        author: 'John Doe',
      };

      const result = await repository.addComment(createCommentDto, mockProduct);

      expect(result).toEqual(expect.objectContaining(mockComment));
    });

    it('should throw an error if comment creation fails', async () => {
      mockOrmRepository.save.mockRejectedValueOnce(
        CustomException.fromErrorEnum(Errors.E_0017_COMMENT_CREATION_ERROR),
      );

      const createCommentDto: CreateCommentDto = {
        productId: '1',
        content: 'Excellent product!',
        author: 'John Doe',
      };

      await expect(
        repository.addComment(createCommentDto, mockProduct),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('Find All Comments', () => {
    it('should return all comments for a product', async () => {
      const result = await repository.findAllComments(mockProduct.id);

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockComment)]),
      );
    });

    it('should return an empty array if no comments are found', async () => {
      mockOrmRepository.createQueryBuilder.mockReturnValueOnce({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findAllComments(mockProduct.id);

      expect(result).toEqual([]);
    });
  });

  describe('Delete Comment from a Product', () => {
    it('should delete a comment from a product', async () => {
      const result = await repository.deleteComment(mockComment.id);

      expect(result).toBeUndefined();
    });

    it('should throw an error if comment is not found', async () => {
      mockOrmRepository.findOne.mockResolvedValueOnce(null);

      await expect(repository.deleteComment('invalid-id')).rejects.toThrow(
        Error,
      );
    });
  });
});
