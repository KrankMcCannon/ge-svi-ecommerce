import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Comment, Product } from '../entities';
import { ProductDTO } from './product.dto';

export class CommentDTO {
  @ApiProperty({ description: 'The ID of the comment' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'The content of the comment', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The author of the comment' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({
    description: 'The product ID of the comment',
    type: ProductDTO,
  })
  @Type(() => ProductDTO)
  product: ProductDTO;

  static fromEntity(comment: Comment): CommentDTO {
    if (!comment) {
      return null;
    }

    const commentDTO = new CommentDTO();
    commentDTO.id = comment.id;
    commentDTO.content = comment.content;
    commentDTO.author = comment.author;
    if (commentDTO.product) {
      commentDTO.product = new ProductDTO();
      commentDTO.product.id = comment.product.id;
    }
    return commentDTO;
  }

  static toEntity(dto: CommentDTO): Comment {
    if (!dto) {
      return null;
    }
    const comment = new Comment();
    comment.id = dto.id;
    comment.content = dto.content;
    comment.author = dto.author;
    if (dto.product) {
      comment.product = new Product();
      comment.product.id = dto.product.id;
    }
    return comment;
  }
}
