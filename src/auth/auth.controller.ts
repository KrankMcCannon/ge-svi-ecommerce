import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/config/public.decorator';
import {
  ApiStandardResponse,
  StandardResponse,
} from 'src/config/standard-response.dto';
import { LocalAuthGuard } from 'src/config/strategies/local-auth.guard';
import { CreateUserDto } from 'src/users/dtos';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiStandardResponse({
    description: 'User logged in successfully',
    type: StandardResponse,
  })
  async login(
    @Request() req,
  ): Promise<StandardResponse<{ accessToken: string }>> {
    const token = await this.authService.login(req.user);
    return new StandardResponse(token);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiStandardResponse({
    description: 'User registered successfully',
    type: StandardResponse,
  })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<StandardResponse<any>> {
    const user = await this.authService.register(createUserDto);
    return new StandardResponse(user);
  }
}
