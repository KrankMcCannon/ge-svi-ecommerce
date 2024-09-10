import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { ApiStandardList, StandardList } from 'src/config/standard-list.dto';
import {
  ApiStandardResponse,
  StandardResponse,
} from 'src/config/standard-response.dto';
import {
  AddToCartDto,
  CreateCommentDto,
  CreateProductDto,
  UpdateProductDto,
} from './dtos';
import { Cart, Comment, Product } from './entities';
import { ProductsService } from './products.service';
import { PaginationInfoPipe } from 'src/config/pagination-info.pipe';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiStandardResponse({
    type: CreateProductDto,
    description: 'Create a new product',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<StandardResponse<CreateProductDto>> {
    const product = await this.productsService.createProduct(createProductDto);
    return new StandardResponse(product);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of products with pagination' })
  @ApiStandardList({
    type: Product,
    description: 'Get a list of products with pagination',
  })
  async findAll(
    @Query(new PaginationInfoPipe()) paginationInfo: PaginationInfo,
    @Query('sort') sort?: string,
    @Query() filter?: any,
  ): Promise<StandardList<Product>> {
    const products = await this.productsService.findAllProducts(
      paginationInfo,
      sort,
      filter,
    );
    return new StandardList(products, products.length, paginationInfo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiStandardResponse({ type: Product, description: 'Get a product by ID' })
  async findOne(@Param('id') id: number): Promise<StandardResponse<Product>> {
    const product = await this.productsService.findProductById(id);
    return new StandardResponse(product);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiStandardResponse({
    type: UpdateProductDto,
    description: 'Update a product by ID',
  })
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<StandardResponse<UpdateProductDto>> {
    const updatedProduct = await this.productsService.updateProduct(
      id,
      updateProductDto,
    );
    return new StandardResponse(updatedProduct);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiStandardResponse({ type: Boolean, description: 'Delete a product by ID' })
  async remove(@Param('id') id: number): Promise<StandardResponse<boolean>> {
    await this.productsService.removeProduct(id);
    return new StandardResponse(true);
  }

  @Post('cart')
  @ApiOperation({ summary: 'Add a product to the cart' })
  @ApiStandardResponse({
    type: AddToCartDto,
    description: 'Add a product to the cart',
  })
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
  ): Promise<StandardResponse<Cart>> {
    const cartItem = await this.productsService.addToCart(addToCartDto);
    return new StandardResponse(cartItem);
  }

  @Get('cart')
  @ApiOperation({ summary: 'Get a list of products in the cart' })
  @ApiStandardList({
    type: Cart,
    description: 'Get a list of products in the cart',
  })
  async findCart(
    @Query(new PaginationInfoPipe()) paginationInfo: PaginationInfo,
  ): Promise<StandardList<Cart>> {
    const cartItems = await this.productsService.findCart(paginationInfo);
    return new StandardList(cartItems, cartItems.length, paginationInfo);
  }

  @Delete('cart/:id')
  @ApiOperation({ summary: 'Remove a product from the cart' })
  @ApiStandardResponse({
    type: Boolean,
    description: 'Remove a product from the cart',
  })
  async removeFromCart(
    @Param('id') id: number,
  ): Promise<StandardResponse<boolean>> {
    await this.productsService.removeFromCart(id);
    return new StandardResponse(true);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a product' })
  @ApiStandardResponse({
    type: CreateCommentDto,
    description: 'Add a comment to a product',
  })
  async addComment(
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<StandardResponse<Comment>> {
    const comment = await this.productsService.addComment(createCommentDto);
    return new StandardResponse(comment);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get a list of comments for a product' })
  @ApiStandardList({
    type: Comment,
    description: 'Get a list of comments for a product',
  })
  async findAllComments(
    @Param('id') productId: number,
    @Query(new PaginationInfoPipe()) paginationInfo: PaginationInfo,
  ): Promise<StandardList<Comment>> {
    const comments = await this.productsService.findAllComments(
      productId,
      paginationInfo,
    );
    return new StandardList(comments, comments.length, paginationInfo);
  }
}
