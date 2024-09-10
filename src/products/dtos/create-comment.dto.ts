import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The ID of the product to comment on' })
  productId: number;

  @ApiProperty({ description: 'The content of the comment' })
  content: string;

  @ApiProperty({ description: 'The author of the comment' })
  author: string;
}
