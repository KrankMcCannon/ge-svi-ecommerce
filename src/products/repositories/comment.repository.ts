import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from '../dtos';
import { Product } from '../entities/product.entity';
import { PaginationInfo } from 'src/config/pagination-info.dto';

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
    const comment = this.commentRepo.create({ ...createCommentDto, product });
    return this.commentRepo.save(comment);
  }

  async findAllComments(
    productId: number,
    pagination: PaginationInfo,
  ): Promise<Comment[]> {
    const pageNumber = pagination.pageNumber || 0;
    const pageSize = pagination.pageSize || 20;
    const query = this.commentRepo
      .createQueryBuilder('comment')
      .where('comment.productId = :productId', { productId })
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize);

    return query.getMany();
  }
}
