import { Injectable } from '@nestjs/common';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { DataSource, EntityManager } from 'typeorm';
import { CreateCommentDto, CreateProductDto, UpdateProductDto } from './dtos';
import { CommentDTO } from './dtos/comment.dto';
import { ProductDTO } from './dtos/product.dto';
import { CommentRepository } from './repositories/comments.repository';
import { ProductsRepository } from './repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly commentRepo: CommentRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new product.
   *
   * @param createProductDto - Data Transfer Object for creating a product.
   * @returns The created product.
   */
  async createProduct(createProductDto: CreateProductDto): Promise<ProductDTO> {
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

  /**
   * Finds all products with optional filters, pagination, and sorting.
   *
   * @param pagination - Pagination information.
   * @param sort - Sorting options.
   * @param filter - Filters.
   * @returns List of products.
   */
  async findAllProducts(
    pagination: PaginationInfo,
    sort: string,
    filter: any,
  ): Promise<ProductDTO[]> {
    return await this.productsRepo.findAll({ sort, ...filter }, pagination);
  }

  /**
   * Finds a product by ID.
   *
   * @param id - Product ID.
   * @param manager - Optional transaction manager.
   * @returns The found product.
   */
  async findProductById(
    id: string,
    manager?: EntityManager,
  ): Promise<ProductDTO> {
    if (!id) {
      throw CustomException.fromErrorEnum(Errors.E_0004_VALIDATION_KO, {
        data: { id },
      });
    }
    return await this.productsRepo.findOneById(id, manager);
  }

  /**
   * Updates a product.
   *
   * @param id - Product ID.
   * @param updateProductDto - Data Transfer Object for updating a product.
   * @returns The updated product.
   */
  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDTO> {
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

  /**
   * Removes a product.
   *
   * @param id - Product ID.
   */
  async removeProduct(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.productsRepo.removeProduct(id, queryRunner.manager);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0008_PRODUCT_REMOVE_ERROR, {
        data: { id },
        originalError: error,
      });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Saves a product.
   *
   * @param inputProduct - Product data.
   * @param manager - Optional transaction manager.
   * @returns The saved product.
   */
  async saveProduct(
    inputProduct: ProductDTO,
    manager?: EntityManager,
  ): Promise<ProductDTO> {
    return await this.productsRepo.saveProduct(inputProduct, manager);
  }

  /**
   * Adds a comment to a product.
   *
   * @param createCommentDto - Data Transfer Object for creating a comment.
   * @returns The created comment.
   */
  async addComment(createCommentDto: CreateCommentDto): Promise<CommentDTO> {
    const product = await this.findProductById(createCommentDto.productId);
    return await this.commentRepo.addComment(createCommentDto, product);
  }

  /**
   * Finds all comments for a product.
   *
   * @param productId - Product ID.
   * @param paginationInfo - Pagination information.
   * @returns List of comments.
   */
  async findAllComments(
    productId: string,
    paginationInfo: PaginationInfo,
  ): Promise<CommentDTO[]> {
    await this.findProductById(productId);
    return await this.commentRepo.findAllComments(productId, paginationInfo);
  }
}
