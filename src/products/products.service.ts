import { Injectable } from '@nestjs/common';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { DataSource, EntityManager } from 'typeorm';
import { CreateCommentDto, CreateProductDto, UpdateProductDto } from './dtos';
import { Comment, Product } from './entities';
import { CommentRepository } from './repositories/comments.repository';
import { ProductsRepository } from './repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly commentRepo: CommentRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productsRepo.findByName(
      createProductDto.name,
    );
    if (existingProduct) {
      throw CustomException.fromErrorEnum(Errors.E_0011_DUPLICATE_PRODUCT, {
        data: { name: createProductDto.name },
      });
    }
    return await this.productsRepo.createProduct(createProductDto);
  }

  async findAllProducts(
    pagination: PaginationInfo,
    sort: string,
    filter: any,
  ): Promise<Product[]> {
    return await this.productsRepo.findAll({ sort, ...filter }, pagination);
  }

  async findProductById(id: string, manager?: EntityManager): Promise<Product> {
    if (!id) {
      throw CustomException.fromErrorEnum(Errors.E_0004_VALIDATION_KO, {
        data: { id },
      });
    }
    return await this.productsRepo.findOneById(id, manager);
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
      return updatedProduct;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      CustomLogger.error(`Error updating product with ID ${id}`, error);
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0007_PRODUCT_UPDATE_ERROR, {
        data: { id, updateProductDto },
        originalError: error,
      });
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
      if (!(error instanceof CustomException)) {
        CustomLogger.error(`Error removing product with ID ${id}`, error);
        throw CustomException.fromErrorEnum(
          Errors.E_0008_PRODUCT_REMOVE_ERROR,
          {
            data: { id },
            originalError: error,
          },
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async saveProduct(
    product: Product,
    manager?: EntityManager,
  ): Promise<Product> {
    return await this.productsRepo.saveProduct(product, manager);
  }

  async addComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    const product = await this.findProductById(createCommentDto.productId);
    return await this.commentRepo.addComment(createCommentDto, product);
  }

  async findAllComments(
    productId: string,
    paginationInfo: PaginationInfo,
  ): Promise<Comment[]> {
    await this.findProductById(productId);
    return await this.commentRepo.findAllComments(productId, paginationInfo);
  }
}
