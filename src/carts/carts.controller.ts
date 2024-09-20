import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { AddCartItemToCartDto, CartDTO, CartItemDTO } from './dtos';

@ApiTags('Carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Add a product to the cart' })
  @ApiStandardResponse({
    type: CartDTO,
    description: 'Add a product to the cart',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createCartOrAddToCart(
    @Request() req: any,
    @Body() addCartItemToCartDto: AddCartItemToCartDto,
  ): Promise<StandardResponse<CartDTO>> {
    const cart = await this.cartsService.createCartOrAddToCart(
      req.user.id,
      addCartItemToCartDto,
    );
    return new StandardResponse(cart);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Get the cart info' })
  @ApiStandardList({
    type: CartItemDTO,
    description: 'Get the cart info',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findCart(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StandardResponse<CartDTO>> {
    const cart = await this.cartsService.findCartById(id);
    return new StandardResponse(cart);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Update the cart' })
  @ApiStandardResponse({
    type: CartDTO,
    description: 'Update the cart',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCart(
    @Request() req: any,
    @Body() cartDto: AddCartItemToCartDto,
  ): Promise<StandardResponse<CartDTO>> {
    const cart = await this.cartsService.createCartOrAddToCart(
      req.user.id,
      cartDto,
    );
    return new StandardResponse(cart);
  }

  @Get(':id/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Get a list of products in the cart' })
  @ApiStandardList({
    type: CartItemDTO,
    description: 'Get a list of products in the cart',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findCartItems(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query(new PaginationInfoPipe()) pagination: PaginationInfo,
    @Query('sort') sort?: string,
    @Query() filter?: any,
  ): Promise<StandardList<CartItemDTO>> {
    const cartItems = await this.cartsService.findCartItems(id, {
      pagination,
      sort,
      filter,
    });
    return new StandardList(cartItems, cartItems.length, pagination);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Remove a item from the cart' })
  @ApiStandardResponse({
    type: Boolean,
    description: 'Remove a item from the cart',
  })
  async deleteCart(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StandardResponse<boolean>> {
    await this.cartsService.deleteCart(id);
    return new StandardResponse(true);
  }

  @Delete(':cartId/item/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Remove a item from the cart' })
  @ApiStandardResponse({
    type: Boolean,
    description: 'Remove a item from the cart',
  })
  async removeItemFromCart(
    @Request() req: any,
    @Param('cartId', new ParseUUIDPipe()) cartId: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ): Promise<StandardResponse<boolean>> {
    await this.cartsService.removeItemFromCart(cartId, itemId);
    return new StandardResponse(true);
  }
}
