import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { CommentDTO, ProductDTO } from '../dtos';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { Product } from '../entities';
import { Comment } from '../entities/comment.entity';
import { CommentRepository } from './comments.repository';

describe('CommentRepository', () => {
  let repository: CommentRepository;

  const mockProduct: ProductDTO = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 50,
    stock: 100,
  };

  const mockComment: CommentDTO = {
    id: '1',
    content: 'Excellent product!',
    author: 'John Doe',
    product: mockProduct,
  };

  const mockOrmRepository = {
    create: jest.fn().mockReturnValue(mockComment),
    save: jest.fn().mockResolvedValue(mockComment),
    findOne: jest.fn().mockResolvedValue(mockComment),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
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
  });

  describe('Find All Comments', () => {
    it('should return all comments for a product', async () => {
      const paginationInfo = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
        paginationEnabled: true,
      });

      const result = await repository.findAllComments(
        mockProduct.id,
        paginationInfo,
      );

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining(mockComment)]),
      );
    });
  });

  describe('Delete Comment from a Product', () => {
    it('should delete a comment from a product', async () => {
      const result = await repository.deleteComment(mockComment.id);

      expect(result).toBeUndefined();
    });
  });
});
