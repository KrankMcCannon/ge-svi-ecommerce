import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../base.repository';
import { CommentDTO } from '../dtos';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { ProductDTO } from '../dtos/product.dto';
import { Comment } from '../entities/comment.entity';

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
   * @returns The created comment.
   */
  async addComment(
    createCommentDto: CreateCommentDto,
    inputProduct: ProductDTO,
  ): Promise<CommentDTO> {
    try {
      const product = ProductDTO.toEntity(inputProduct);
      const createdComment = this.commentRepo.create({
        ...createCommentDto,
        productId: product.id,
      });
      const comment = await this.saveEntity(createdComment);
      return CommentDTO.fromEntity(comment);
    } catch (error) {
      CustomLogger.error('Error adding comment', error);
      throw CustomException.fromErrorEnum(
        Errors.E_0017_COMMENT_CREATION_ERROR,
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
   * @param pagination Pagination information.
   * @returns List of comments.
   */
  async findAllComments(
    productId: string,
    pagination: PaginationInfo,
  ): Promise<CommentDTO[]> {
    const qb = this.commentRepo.createQueryBuilder('comment');
    qb.where('comment.productId = :productId', { productId });
    qb.orderBy('comment.createdAt', 'DESC');
    this.applyPagination(qb, pagination);
    const comments = await qb.getMany();
    return comments.map(CommentDTO.fromEntity);
  }

  /**
   * Deletes a comment by ID.
   *
   * @param id Comment ID.
   * @param manager Optional transaction manager.
   */
  async deleteComment(id: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(Comment) : this.commentRepo;
    try {
      const comment = await repo.findOne({
        where: { id },
      });
      if (!comment) {
        throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, {
          data: { id },
        });
      }
      await repo.delete(id);
    } catch (error) {
      throw CustomException.fromErrorEnum(
        Errors.E_0021_COMMENT_DELETION_ERROR,
        {
          data: { id },
          originalError: error,
        },
      );
    }
  }
}
