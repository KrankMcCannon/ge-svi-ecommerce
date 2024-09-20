import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { PaginationInfoPipe } from 'src/config/pagination-info.pipe';
import { Roles } from 'src/config/roles.decorator';
import { StandardList } from 'src/config/standard-list.dto';
import {
  ApiStandardResponse,
  StandardResponse,
} from 'src/config/standard-response.dto';
import { JwtAuthGuard } from 'src/config/strategies/jwt-auth.guard';
import { RolesGuard } from 'src/config/strategies/roles.guard';
import { OrderDTO } from './dtos/order.dto';
import { OrderStatus } from './enum';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Checkout the cart and make the order' })
  @ApiStandardResponse({ type: OrderDTO, description: 'Order created' })
  async checkout(@Request() req: any): Promise<StandardResponse<OrderDTO>> {
    const order = await this.ordersService.checkout(req.user.id);
    return new StandardResponse(order);
  }

  @Get()
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiStandardResponse({ type: OrderDTO, description: 'Order found' })
  async findOrders(
    @Request() req: any,
    @Query(new PaginationInfoPipe()) pagination: PaginationInfo,
    @Query('sort') sort?: string,
    @Query() filter?: any,
  ): Promise<StandardList<OrderDTO>> {
    const orders = await this.ordersService.findOrdersByUserId(req.user.id, {
      pagination,
      sort,
      filter,
    });
    return new StandardList(orders, orders.length, pagination);
  }

  @Get(':id')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiStandardResponse({ type: OrderDTO, description: 'Order found' })
  async findOrder(
    @Param('id') id: string,
  ): Promise<StandardResponse<OrderDTO>> {
    const order = await this.ordersService.findOrderById(id);
    return new StandardResponse(order);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update an order status by id' })
  @ApiStandardResponse({ type: OrderDTO, description: 'Order updated' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() status: OrderStatus,
  ): Promise<StandardResponse<OrderDTO>> {
    const order = await this.ordersService.updateOrderStatus(id, status);
    return new StandardResponse(order);
  }
}
