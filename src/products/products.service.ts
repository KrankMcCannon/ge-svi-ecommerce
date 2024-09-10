import { Injectable } from '@nestjs/common';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import {
  AddToCartDto,
  CreateCommentDto,
  CreateProductDto,
  UpdateProductDto,
} from './dtos';
import { Cart, Comment, Product } from './entities';
import { CartRepository } from './repositories/cart.repository';
import { CommentRepository } from './repositories/comment.repository';
import { ProductsRepository } from './repositories/products.repository';
import { ValidationService } from './validation-properties.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly cartRepo: CartRepository,
    private readonly commentRepo: CommentRepository,
    private readonly validationService: ValidationService,
  ) {}

  private readonly validationRules = {
    name: (value: any) => typeof value === 'string' && value.trim().length > 0,
    description: (value: any) =>
      typeof value === 'string' && value.trim().length > 0,
    price: (value: any) => typeof value === 'number' && value > 0,
    stock: (value: any) => Number.isInteger(value) && value >= 0,
  };

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    this.validationService.validate(createProductDto, this.validationRules);
    return this.productsRepo.createProduct(createProductDto);
  }

  async findAllProducts(
    pagination: PaginationInfo,
    sort: string,
    filter: any,
  ): Promise<Product[]> {
    return this.productsRepo.findAll({ sort, ...filter }, pagination);
  }

  async findProductById(id: number): Promise<Product> {
    return this.throwIfNotFound(
      await this.productsRepo.findOneById(id),
      'Product',
    );
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    this.validationService.validate(updateProductDto, this.validationRules);
    return this.throwIfNotFound(
      await this.productsRepo.updateProduct(id, updateProductDto),
      'Product',
    );
  }

  async removeProduct(id: number): Promise<void> {
    const product = await this.findProductById(id);
    await this.productsRepo.removeProduct(product.id);
  }

  async addToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    const product = await this.findProductById(addToCartDto.productId);
    return this.cartRepo.addToCart(addToCartDto, product);
  }

  async findCart(paginationInfo: PaginationInfo): Promise<Cart[]> {
    return this.cartRepo.findCart(paginationInfo);
  }

  async removeFromCart(id: number): Promise<void> {
    const cartItem = this.throwIfNotFound(
      await this.cartRepo.findOneById(id),
      'Cart item',
    );
    await this.cartRepo.removeCartItem(cartItem.id);
  }

  async addComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    const product = await this.findProductById(createCommentDto.productId);
    return this.commentRepo.addComment(createCommentDto, product);
  }

  async findAllComments(
    productId: number,
    paginationInfo: PaginationInfo,
  ): Promise<Comment[]> {
    await this.findProductById(productId);
    return this.commentRepo.findAllComments(productId, paginationInfo);
  }

  private throwIfNotFound<T>(entity: T | null, entityName: string): T {
    if (!entity) {
      throw CustomException.fromErrorEnum(Errors.E_0002_NOT_FOUND_ERROR, {
        errorDescription: `${entityName} not found.`,
      });
    }
    return entity;
  }
}
