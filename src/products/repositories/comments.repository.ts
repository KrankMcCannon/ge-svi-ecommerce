import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../base.repository';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { Comment, Product } from '../entities';

@Injectable()
export class CommentRepository extends BaseRepository<Comment> {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {
    super(commentRepo);
  }

  /**
   * Adds a comment to a product.
   *
   * @param createCommentDto DTO for creating a comment.
   * @param product The product being commented on.
   * @param manager Optional transaction manager.
   * @returns The created comment.
   * @throws CustomException if there is an error creating the comment.
   */
  async addComment(
    createCommentDto: CreateCommentDto,
    product: Product,
    manager?: EntityManager,
  ): Promise<Comment> {
    const repo = manager ? manager.getRepository(Comment) : this.commentRepo;
    try {
      const createdComment = repo.create({
        ...createCommentDto,
        product,
      });
      return await this.saveEntity(createdComment, manager);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(
        Errors.E_0030_COMMENT_CREATION_ERROR,
        {
          data: { comment: createCommentDto },
          originalError: error,
        },
      );
    }
  }

  /**
   * Retrieves all comments for a product with pagination.
   *
   * @param productId The ID of the product.
   * @param query Optional query parameters.
   * @param manager Optional transaction manager.
   * @returns List of comments.
   */
  async findAllComments(
    productId: string,
    query?: {
      pagination?: PaginationInfo;
      sort?: string;
      filter?: any;
    },
    manager?: EntityManager,
  ): Promise<Comment[]> {
    const repo = manager ? manager.getRepository(Comment) : this.commentRepo;
    const qb = repo.createQueryBuilder('comment');
    qb.where('comment.productId = :productId', { productId });
    qb.innerJoinAndSelect('comment.product', 'product');

    this.applySorting(qb, query?.sort);
    this.applyFilters(qb, query?.filter);
    this.applyPagination(qb, query?.pagination);

    return await qb.getMany();
  }

  /**
   * Deletes a comment by ID.
   *
   * @param id Comment ID.
   * @param manager Optional transaction manager.
   * @throws CustomException if the comment is not found.
   */
  async deleteComment(id: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(Comment) : this.commentRepo;
    try {
      const comment = await repo.findOne({
        where: { id },
      });
      if (!comment) {
        throw CustomException.fromErrorEnum(Errors.E_0032_COMMENT_NOT_FOUND, {
          data: { id },
        });
      }
      await repo.delete(id);
    } catch (error) {
      throw CustomException.fromErrorEnum(
        Errors.E_0034_COMMENT_DELETION_ERROR,
        {
          data: { id },
          originalError: error,
        },
      );
    }
  }
}
