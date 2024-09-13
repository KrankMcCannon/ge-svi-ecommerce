import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { Comment } from '../entities/comment.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async addComment(
    createCommentDto: CreateCommentDto,
    product: Product,
  ): Promise<Comment> {
    try {
      const comment = this.commentRepo.create({ ...createCommentDto, product });
      return await this.commentRepo.save(comment);
    } catch (error) {
      CustomLogger.error('Error adding comment', error);
      throw CustomException.fromErrorEnum(
        Errors.E_0018_COMMENT_CREATION_ERROR,
        error,
      );
    }
  }

  async findAllComments(
    productId: string,
    pagination: PaginationInfo,
  ): Promise<Comment[]> {
    try {
      const qb = this.commentRepo.createQueryBuilder('comment');
      qb.where('comment.productId = :productId', { productId });

      this.applyPagination(qb, pagination);
      qb.orderBy('comment.createdAt', 'DESC');

      return await qb.getMany();
    } catch (error) {
      CustomLogger.error(
        `Error fetching comments for product ${productId}`,
        error,
      );
      throw CustomException.fromErrorEnum(
        Errors.E_0019_COMMENT_FETCH_ERROR,
        error,
      );
    }
  }

  private applyPagination(
    qb: SelectQueryBuilder<Comment>,
    pagination: PaginationInfo,
  ) {
    const { pageNumber = 0, pageSize = 20 } = pagination;
    qb.skip(pageNumber * pageSize).take(pageSize);
  }
}
