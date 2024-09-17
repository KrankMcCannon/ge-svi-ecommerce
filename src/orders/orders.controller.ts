import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/config/roles.decorator';
import {
  ApiStandardResponse,
  StandardResponse,
} from 'src/config/standard-response.dto';
import { JwtAuthGuard } from 'src/config/strategies/jwt-auth.guard';
import { RolesGuard } from 'src/config/strategies/roles.guard';
import { OrderDTO } from './dtos/order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Checkout the cart' })
  @ApiStandardResponse({ type: OrderDTO, description: 'Order created' })
  async checkout(
    @Body('userId') userId: string,
  ): Promise<StandardResponse<OrderDTO>> {
    const order = await this.ordersService.checkout(userId);
    return new StandardResponse(order);
  }

  @Get(':id')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiStandardResponse({ type: OrderDTO, description: 'Order found' })
  async findOne(@Param('id') id: string): Promise<StandardResponse<OrderDTO>> {
    const order = await this.ordersService.findOrderById(id);
    return new StandardResponse(order);
  }
}
