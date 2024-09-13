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
import { DataSource } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly cartRepo: CartRepository,
    private readonly commentRepo: CommentRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    try {
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

  async findProductById(id: string): Promise<Product> {
    if (!id) {
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
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const updatedProduct = await this.productsRepo.updateProduct(
        id,
        updateProductDto,
        queryRunner.manager,
      );
      await queryRunner.commitTransaction();
      return this.throwIfNotFound(updatedProduct, 'Product');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      CustomLogger.error(`Error updating product with ID ${id}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeProduct(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.productsRepo.removeProduct(id, queryRunner.manager);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      CustomLogger.error(`Error removing product with ID ${id}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const product = await this.productsRepo.findOneById(
        addToCartDto.productId,
        queryRunner.manager,
      );

      if (addToCartDto.quantity > product.stock) {
        throw CustomException.fromErrorEnum(Errors.E_0011_INSUFFICIENT_STOCK, {
          errorDescription: 'Insufficient stock for the product.',
        });
      }

      product.stock -= addToCartDto.quantity;
      await this.productsRepo.saveProduct(product, queryRunner.manager);

      const cartItem = await this.cartRepo.addToCart(
        addToCartDto,
        product,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return cartItem;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      CustomLogger.error('Error adding product to cart', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findCart(paginationInfo: PaginationInfo): Promise<Cart[]> {
    try {
      return await this.cartRepo.findCart(paginationInfo);
    } catch (error) {
      CustomLogger.error('Error fetching cart', error);
      throw error;
    }
  }

  async removeFromCart(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const cartItem = await this.cartRepo.findOneById(id, queryRunner.manager);
      if (!cartItem) {
        throw CustomException.fromErrorEnum(Errors.E_0016_CART_ITEM_NOT_FOUND, {
          errorDescription: 'Cart item not found.',
        });
      }

      const product = await this.productsRepo.findOneById(
        cartItem.product.id,
        queryRunner.manager,
      );
      product.stock += cartItem.quantity;
      await this.productsRepo.saveProduct(product, queryRunner.manager);

      await this.cartRepo.removeCartItem(id, queryRunner.manager);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      CustomLogger.error(`Error removing cart item with ID ${id}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    try {
      const product = await this.findProductById(createCommentDto.productId);
      return await this.commentRepo.addComment(createCommentDto, product);
    } catch (error) {
      CustomLogger.error('Error adding comment', error);
      throw error;
    }
  }

  async findAllComments(
    productId: string,
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
