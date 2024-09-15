import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from './config/roles.decorator';
import { JwtAuthGuard } from './config/strategies/jwt-auth.guard';
import { RolesGuard } from './config/strategies/roles.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getHello(): string {
    return this.appService.getHello();
  }
}
