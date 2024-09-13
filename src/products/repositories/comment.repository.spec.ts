import { Test, TestingModule } from '@nestjs/testing';
import { CommentRepository } from './comment.repository';
import { Comment } from '../entities/comment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { Product } from '../entities/product.entity';
import { PaginationInfo } from 'src/config/pagination-info.dto';

describe('CommentRepository', () => {
  let repository: CommentRepository;
  let ormRepository: jest.Mocked<Repository<Comment>>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 50,
    stock: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    cartItems: [],
    comments: [],
  };

  const mockComment: Comment = {
    id: '1',
    product: mockProduct,
    content: 'Excellent product!',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: null,
  };

  const mockOrmRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
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
    ormRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    ) as jest.Mocked<Repository<Comment>>;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addComment', () => {
    it('should add a comment to a product', async () => {
      const createCommentDto: CreateCommentDto = {
        productId: '1',
        content: 'Excellent product!',
        author: 'John Doe',
      };

      ormRepository.create.mockReturnValue(mockComment);
      ormRepository.save.mockResolvedValue(mockComment);

      const result = await repository.addComment(createCommentDto, mockProduct);

      expect(ormRepository.create).toHaveBeenCalledWith({
        content: createCommentDto.content,
        product: mockProduct,
      });
      expect(ormRepository.save).toHaveBeenCalledWith(mockComment);
      expect(result).toEqual(mockComment);
    });
  });

  describe('findAllComments', () => {
    it('should return all comments for a product', async () => {
      ormRepository.find.mockResolvedValue([mockComment]);

      const paginationInfo = new PaginationInfo({
        pageNumber: 0,
        pageSize: 10,
        paginationEnabled: true,
      });

      const result = await repository.findAllComments('1', paginationInfo);

      expect(ormRepository.find).toHaveBeenCalledWith({
        where: { product: { id: '1' } },
        relations: ['product'],
      });
      expect(result).toEqual([mockComment]);
    });
  });
});
