import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/config/public.decorator';
import { Roles } from 'src/config/roles.decorator';
import { JwtAuthGuard } from 'src/config/strategies/jwt-auth.guard';
import { RolesGuard } from 'src/config/strategies/roles.guard';
import { CreateUserDto } from './dtos';
import { UsersService } from './users.service';
import { StandardResponse } from 'src/config/standard-response.dto';
import { User } from './entities';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<StandardResponse<User>> {
    const user = await this.usersService.create(createUserDto);
    return new StandardResponse(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'User found' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StandardResponse<User>> {
    const user = await this.usersService.findById(id);
    return new StandardResponse(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: CreateUserDto,
  ): Promise<StandardResponse<User>> {
    const user = await this.usersService.update(id, updateUserDto);
    return new StandardResponse(user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StandardResponse<boolean>> {
    await this.usersService.delete(id);
    return new StandardResponse(true);
  }
}
