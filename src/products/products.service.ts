import { Injectable } from '@nestjs/common';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
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

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly cartRepo: CartRepository,
    private readonly commentRepo: CommentRepository,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    try {
      return await this.productsRepo.createProduct(createProductDto);
    } catch (error) {
      CustomLogger.error('Error creating product', error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async findAllProducts(
    pagination: PaginationInfo,
    sort: string,
    filter: any,
  ): Promise<Product[]> {
    try {
      return await this.productsRepo.findAll({ sort, ...filter }, pagination);
    } catch (error) {
      CustomLogger.error('Error fetching products', error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async findProductById(id: number): Promise<Product> {
    try {
      const product = await this.productsRepo.findOneById(id);
      if (!product) {
        throw CustomException.fromErrorEnum(Errors.E_0002_NOT_FOUND_ERROR);
      }
      return product;
    } catch (error) {
      CustomLogger.error(`Error fetching product with ID ${id}`, error);
      throw CustomException.fromErrorEnum(Errors.E_0002_NOT_FOUND_ERROR, error);
    }
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      return await this.productsRepo.updateProduct(id, updateProductDto);
    } catch (error) {
      CustomLogger.error('Error updating product', error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async removeProduct(id: number): Promise<void> {
    try {
      return await this.productsRepo.removeProduct(id);
    } catch (error) {
      CustomLogger.error(`Error removing product with ID ${id}`, error);
      throw CustomException.fromErrorEnum(Errors.E_0002_NOT_FOUND_ERROR, error);
    }
  }

  async addToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    try {
      const product = await this.findProductById(addToCartDto.productId);
      return this.cartRepo.addToCart(addToCartDto, product);
    } catch (error) {
      CustomLogger.error('Error adding to cart', error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async findCart(paginationInfo: PaginationInfo): Promise<Cart[]> {
    try {
      return this.cartRepo.findCart(paginationInfo);
    } catch (error) {
      CustomLogger.error('Error fetching cart', error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async removeFromCart(id: number): Promise<void> {
    try {
      const cartItem = await this.cartRepo.findOneById(id);
      if (!cartItem) {
        throw CustomException.fromErrorEnum(Errors.E_0002_NOT_FOUND_ERROR);
      }
      await this.cartRepo.removeCartItem(id);
    } catch (error) {
      CustomLogger.error(`Error removing cart item with ID ${id}`, error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async addComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    try {
      const product = await this.findProductById(createCommentDto.productId);
      return this.commentRepo.addComment(createCommentDto, product);
    } catch (error) {
      CustomLogger.error('Error adding comment', error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async findAllComments(
    productId: number,
    paginationInfo: PaginationInfo,
  ): Promise<Comment[]> {
    try {
      return this.commentRepo.findAllComments(productId, paginationInfo);
    } catch (error) {
      CustomLogger.error(
        `Error fetching comments for product ${productId}`,
        error,
      );
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }
}
