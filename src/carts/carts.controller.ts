import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { PaginationInfoPipe } from 'src/config/pagination-info.pipe';
import { Roles } from 'src/config/roles.decorator';
import { ApiStandardList, StandardList } from 'src/config/standard-list.dto';
import {
  ApiStandardResponse,
  StandardResponse,
} from 'src/config/standard-response.dto';
import { JwtAuthGuard } from 'src/config/strategies/jwt-auth.guard';
import { RolesGuard } from 'src/config/strategies/roles.guard';
import { CartsService } from './carts.service';
import { AddCartItemToCartDto } from './dtos';
import { Cart } from './entities';
import { CartItem } from './entities/cartItem.entity';

@ApiTags('Carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('cart')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Add a product to the cart' })
  @ApiStandardResponse({
    type: Cart,
    description: 'Add a product to the cart',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async addToCart(
    @Body() addToCartDto: AddCartItemToCartDto,
    @Request() req: any,
  ): Promise<StandardResponse<Cart>> {
    const userId = req.user.id;
    const cartItem = await this.cartsService.addProductToCart(
      userId,
      addToCartDto,
    );
    return new StandardResponse(cartItem);
  }

  @Get('cart/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Get a list of products in the cart' })
  @ApiStandardList({
    type: Cart,
    description: 'Get a list of products in the cart',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findCartItems(
    @Request() req: any,
    @Query(new PaginationInfoPipe()) paginationInfo: PaginationInfo,
    @Query('sort') sort?: string,
    @Query() filter?: any,
  ): Promise<StandardList<CartItem>> {
    const userId = req.user.id;
    const cartItems = await this.cartsService.findCartItems(
      userId,
      paginationInfo,
      sort,
      filter,
    );
    return new StandardList(cartItems, cartItems.length, paginationInfo);
  }

  @Delete('cart/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Remove a product from the cart' })
  @ApiStandardResponse({
    type: Boolean,
    description: 'Remove a product from the cart',
  })
  async removeFromCart(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { productId: string },
  ): Promise<StandardResponse<boolean>> {
    const userId = req.user.id;
    await this.cartsService.removeProductFromCart(userId, id, body.productId);
    return new StandardResponse(true);
  }
}
