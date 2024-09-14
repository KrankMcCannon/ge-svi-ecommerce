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
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { PaginationInfoPipe } from 'src/config/pagination-info.pipe';
import { ApiStandardList, StandardList } from 'src/config/standard-list.dto';
import {
  ApiStandardResponse,
  StandardResponse,
} from 'src/config/standard-response.dto';
import { JwtAuthGuard } from 'src/config/strategies/jwt-auth.guard';
import { CreateCommentDto, CreateProductDto, UpdateProductDto } from './dtos';
import { Comment, Product } from './entities';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiStandardResponse({
    type: Product,
    description: 'Create a new product',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<StandardResponse<Product>> {
    const product = await this.productsService.createProduct(createProductDto);
    return new StandardResponse(product);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of products with pagination' })
  @ApiStandardList({
    type: Product,
    description: 'Get a list of products with pagination',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
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
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StandardResponse<Product>> {
    const product = await this.productsService.findProductById(id);
    return new StandardResponse(product);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiStandardResponse({
    type: Product,
    description: 'Update a product by ID',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<StandardResponse<Product>> {
    const updatedProduct = await this.productsService.updateProduct(
      id,
      updateProductDto,
    );
    return new StandardResponse(updatedProduct);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiStandardResponse({ type: Boolean, description: 'Delete a product by ID' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StandardResponse<boolean>> {
    await this.productsService.removeProduct(id);
    return new StandardResponse(true);
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a product' })
  @ApiStandardResponse({
    type: Comment,
    description: 'Add a comment to a product',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAllComments(
    @Param('id', new ParseUUIDPipe()) productId: string,
    @Query(new PaginationInfoPipe()) paginationInfo: PaginationInfo,
  ): Promise<StandardList<Comment>> {
    const comments = await this.productsService.findAllComments(
      productId,
      paginationInfo,
    );
    return new StandardList(comments, comments.length, paginationInfo);
  }
}
