import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateOrderDTO {
  @ApiProperty({ description: 'The unique identifier for the user' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
