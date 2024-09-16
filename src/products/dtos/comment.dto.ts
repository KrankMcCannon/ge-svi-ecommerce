import { ApiProperty } from '@nestjs/swagger';
import { plainToClass, Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Comment } from '../entities';
import { ProductDTO } from './product.dto';

export class CommentDTO {
  @ApiProperty({ description: 'The ID of the comment' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'The product ID of the comment',
    type: ProductDTO,
  })
  @Type(() => ProductDTO)
  product: ProductDTO;

  @ApiProperty({ description: 'The content of the comment', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The author of the comment' })
  @IsString()
  @IsNotEmpty()
  author: string;

  static fromEntity(comment: Comment): CommentDTO {
    return plainToClass(CommentDTO, comment, {
      excludeExtraneousValues: true,
    });
  }

  static toEntity(commentDTO: CommentDTO): Comment {
    const comment = new Comment();
    comment.id = commentDTO.id;
    comment.product = ProductDTO.toEntity(commentDTO.product);
    comment.content = commentDTO.content;
    comment.author = commentDTO.author;
    return comment;
  }
}
