import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'The ID of the product to comment on' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'The content of the comment' })
  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The author of the comment' })
  @IsString()
  @IsNotEmpty()
  author: string;
}
