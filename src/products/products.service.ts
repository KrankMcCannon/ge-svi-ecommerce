import { Injectable } from '@nestjs/common';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { ValidationProperties } from './../config/validation-properties';
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

  private readonly validationRules = {
    name: (value: any) => typeof value === 'string' && value.trim().length > 0,
    description: (value: any) =>
      typeof value === 'string' && value.trim().length > 0,
    price: (value: any) => typeof value === 'number' && value > 0,
    stock: (value: any) => Number.isInteger(value) && value >= 0,
  };

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    try {
      ValidationProperties.validate(createProductDto, this.validationRules);

      const existingProduct = await this.productsRepo.findByName(
        createProductDto.name,
      );
      if (existingProduct) {
        throw CustomException.fromErrorEnum(Errors.E_0012_DUPLICATE_PRODUCT, {
          errorDescription: 'A product with this name already exists.',
        });
      }

      return await this.productsRepo.createProduct(createProductDto);
    } catch (error) {
      CustomLogger.error('Error creating product', error);
      throw error;
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
      CustomLogger.error(
        'Error fetching products with pagination and filtering',
        error,
      );
      throw error;
    }
  }

  async findProductById(id: number): Promise<Product> {
    if (!id || isNaN(id)) {
      throw CustomException.fromErrorEnum(Errors.E_0004_VALIDATION_KO, {
        errorDescription: 'Invalid product ID format.',
      });
    }

    try {
      const product = await this.productsRepo.findOneById(id);
      return this.throwIfNotFound(product, 'Product');
    } catch (error) {
      CustomLogger.error(`Error fetching product with ID ${id}`, error);
      throw error;
    }
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      ValidationProperties.validate(updateProductDto, this.validationRules);
      const product = await this.productsRepo.updateProduct(
        id,
        updateProductDto,
      );
      return this.throwIfNotFound(product, 'Product');
    } catch (error) {
      CustomLogger.error(`Error updating product with ID ${id}`, error);
      throw error;
    }
  }

  async removeProduct(id: number): Promise<void> {
    try {
      const product = await this.findProductById(id);
      await this.productsRepo.removeProduct(product.id);
    } catch (error) {
      CustomLogger.error(`Error removing product with ID ${id}`, error);
      throw error;
    }
  }

  async addToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    try {
      const product = await this.findProductById(addToCartDto.productId);
      if (addToCartDto.quantity > product.stock) {
        throw CustomException.fromErrorEnum(Errors.E_0011_INSUFFICIENT_STOCK, {
          errorDescription: 'Insufficient stock for the product.',
        });
      }

      return await this.cartRepo.addToCart(addToCartDto, product);
    } catch (error) {
      CustomLogger.error('Error adding product to cart', error);
      throw error;
    }
  }

  async findCart(paginationInfo: PaginationInfo): Promise<Cart[]> {
    try {
      const cartItems = await this.cartRepo.findCart(paginationInfo);

      if (!cartItems.length) {
        throw CustomException.fromErrorEnum(Errors.E_0016_CART_EMPTY, {
          errorDescription: 'The cart is empty.',
        });
      }

      return cartItems;
    } catch (error) {
      CustomLogger.error('Error fetching cart', error);
      throw error;
    }
  }

  async removeFromCart(id: number): Promise<void> {
    try {
      const cartItem = await this.cartRepo.findOneById(id);
      if (!cartItem) {
        throw CustomException.fromErrorEnum(Errors.E_0015_CART_ITEM_NOT_FOUND, {
          errorDescription: 'Cart item not found.',
        });
      }
      await this.cartRepo.removeCartItem(id);
    } catch (error) {
      CustomLogger.error(`Error removing cart item with ID ${id}`, error);
      throw error;
    }
  }

  async addComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    try {
      const product = await this.findProductById(createCommentDto.productId);

      if (
        !createCommentDto.content ||
        createCommentDto.content.trim().length < 5
      ) {
        throw CustomException.fromErrorEnum(Errors.E_0020_INVALID_COMMENT, {
          errorDescription: 'Comment content is too short.',
        });
      }

      return await this.commentRepo.addComment(createCommentDto, product);
    } catch (error) {
      CustomLogger.error('Error adding comment', error);
      throw error;
    }
  }

  async findAllComments(
    productId: number,
    paginationInfo: PaginationInfo,
  ): Promise<Comment[]> {
    try {
      await this.findProductById(productId);
      return await this.commentRepo.findAllComments(productId, paginationInfo);
    } catch (error) {
      CustomLogger.error(
        `Error fetching comments for product ID ${productId}`,
        error,
      );
      throw error;
    }
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
