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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { PaginationInfoPipe } from 'src/config/pagination-info.pipe';
import { Public } from 'src/config/public.decorator';
import { Roles } from 'src/config/roles.decorator';
import { ApiStandardList, StandardList } from 'src/config/standard-list.dto';
import {
  ApiStandardResponse,
  StandardResponse,
} from 'src/config/standard-response.dto';
import { JwtAuthGuard } from 'src/config/strategies/jwt-auth.guard';
import { RolesGuard } from 'src/config/strategies/roles.guard';
import {
  CommentDTO,
  CreateCommentDto,
  CreateProductDto,
  ProductDTO,
  UpdateProductDto,
} from './dtos';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiStandardResponse({
    type: ProductDTO,
    description: 'Create a new product',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<StandardResponse<ProductDTO>> {
    const product = await this.productsService.createProduct(createProductDto);
    return new StandardResponse(product);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get a list of products with pagination' })
  @ApiStandardList({
    type: ProductDTO,
    description: 'Get a list of products with pagination',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Query(new PaginationInfoPipe()) pagination: PaginationInfo,
    @Query('sort') sort?: string,
    @Query() filter?: any,
  ): Promise<StandardList<ProductDTO>> {
    const products = await this.productsService.findAllProducts({
      pagination,
      sort,
      filter,
    });
    return new StandardList(products, products.length, pagination);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiStandardResponse({ type: ProductDTO, description: 'Get a product by ID' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StandardResponse<ProductDTO>> {
    const product = await this.productsService.findProductById(id);
    return new StandardResponse(product);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiStandardResponse({
    type: ProductDTO,
    description: 'Update a product by ID',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<StandardResponse<ProductDTO>> {
    const updatedProduct = await this.productsService.updateProduct(
      id,
      updateProductDto,
    );
    return new StandardResponse(updatedProduct);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiStandardResponse({ type: Boolean, description: 'Delete a product by ID' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StandardResponse<boolean>> {
    await this.productsService.removeProduct(id);
    return new StandardResponse(true);
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Add a comment to a product' })
  @ApiStandardResponse({
    type: CommentDTO,
    description: 'Add a comment to a product',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async addComment(
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<StandardResponse<CommentDTO>> {
    const comment = await this.productsService.addComment(createCommentDto);
    return new StandardResponse(comment);
  }

  @Get(':id/comments')
  @Public()
  @ApiOperation({ summary: 'Get a list of comments for a product' })
  @ApiStandardList({
    type: CommentDTO,
    description: 'Get a list of comments for a product',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAllComments(
    @Param('id', new ParseUUIDPipe()) productId: string,
    @Query(new PaginationInfoPipe()) paginationInfo: PaginationInfo,
    @Query('sort') sort?: string,
    @Query() filter?: any,
  ): Promise<StandardList<CommentDTO>> {
    const comments = await this.productsService.findAllComments(productId, {
      pagination: paginationInfo,
      sort,
      filter,
    });
    return new StandardList(comments, comments.length, paginationInfo);
  }
}
