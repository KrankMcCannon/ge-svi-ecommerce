import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/config/public.decorator';
import {
  ApiStandardResponse,
  StandardResponse,
} from 'src/config/standard-response.dto';
import { LocalAuthGuard } from 'src/config/strategies/local-auth.guard';
import { CreateUserDto, UserDTO } from 'src/users/dtos';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @Public()
  @ApiOperation({ summary: 'User login' })
  @ApiStandardResponse({
    description: 'User logged in successfully',
    type: StandardResponse,
  })
  async login(
    @Request() req: any,
  ): Promise<StandardResponse<{ access_token: string }>> {
    const token = await this.authService.login(req.user);
    return new StandardResponse(token);
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'User registration' })
  @ApiStandardResponse({
    description: 'User registered successfully',
    type: StandardResponse,
  })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<StandardResponse<UserDTO>> {
    const user = await this.authService.register(createUserDto);
    return new StandardResponse(user);
  }
}
