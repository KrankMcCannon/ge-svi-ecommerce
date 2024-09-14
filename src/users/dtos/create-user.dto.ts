import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: "The user's full name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "The user's email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The user password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: "The user's role" })
  @IsString()
  role?: string;
}
