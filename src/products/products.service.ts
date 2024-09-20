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
    try {
      await this.productsRepo.findByName(createProductDto.name);
      const product = await this.productsRepo.createProduct(createProductDto);
      return ProductDTO.fromEntity(product);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(
        Errors.E_0006_PRODUCT_CREATION_ERROR,
        {
          data: { product: createProductDto },
          originalError: error,
        },
      );
    }
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
    query?: { pagination?: PaginationInfo; sort?: string; filter?: any },
    manager?: EntityManager,
  ): Promise<ProductDTO[]> {
    const products = await this.productsRepo.findAll(query, manager);
    return products && products.length > 0
      ? products.map(ProductDTO.fromEntity)
      : [];
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
    const product = await this.productsRepo.findOneById(id, manager);
    return ProductDTO.fromEntity(product);
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
      return ProductDTO.fromEntity(updatedProduct);
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
    const entity = ProductDTO.toEntity(inputProduct);
    const product = await this.productsRepo.saveProduct(entity, manager);
    return ProductDTO.fromEntity(product);
  }

  /**
   * Adds a comment to a product.
   *
   * @param createCommentDto - Data Transfer Object for creating a comment.
   * @returns The created comment.
   */
  async addComment(createCommentDto: CreateCommentDto): Promise<CommentDTO> {
    const product = await this.productsRepo.findOneById(
      createCommentDto.productId,
    );
    const comment = await this.commentRepo.addComment(
      createCommentDto,
      product,
    );
    return CommentDTO.fromEntity(comment);
  }

  /**
   * Finds all comments for a product.
   *
   * @param productId - Product ID.
   * @param pagination - Pagination information.
   * @param filter - Filters.
   * @param sort - Sorting options.
   * @returns List of comments.
   */
  async findAllComments(
    productId: string,
    options?: {
      pagination?: PaginationInfo;
      sort?: string;
      filter?: any;
    },
  ): Promise<CommentDTO[]> {
    const product = await this.findProductById(productId);
    const comments = await this.commentRepo.findAllComments(product.id, {
      pagination: options?.pagination,
      sort: options?.sort,
      filter: options?.filter,
    });
    return comments.map(CommentDTO.fromEntity);
  }
}
