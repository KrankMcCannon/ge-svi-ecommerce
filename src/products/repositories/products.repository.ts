import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../base.repository';
import { CreateProductDto, UpdateProductDto } from '../dtos';
import { ProductDTO } from '../dtos/product.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsRepository extends BaseRepository<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {
    super(productRepo);
  }

  /**
   * Creates a new product.
   *
   * @param createProductDto DTO for creating a product.
   * @param manager Optional transaction manager.
   * @returns The created product.
   * @throws CustomException if there is an error creating the product.
   */
  async createProduct(
    createProductDto: CreateProductDto,
    manager?: EntityManager,
  ): Promise<Product> {
    const repo = manager ? manager.getRepository(Product) : this.productRepo;
    try {
      const createdProduct = repo.create(createProductDto);
      return await this.saveEntity(createdProduct, manager);
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
   * @param query Filters and sorting options.
   * @param pagination Pagination information.
   * @returns List of products.
   */
  async findAll(
    query?: { pagination: PaginationInfo; sort: string; filter: any },
    manager?: EntityManager,
  ): Promise<Product[]> {
    const repo = manager ? manager.getRepository(Product) : this.productRepo;
    const qb = repo.createQueryBuilder('product');
    qb.leftJoinAndSelect('product.cartItems', 'cartItems')
      .leftJoinAndSelect('product.comments', 'comments')
      .leftJoinAndSelect('product.orderItems', 'orderItems');

    this.applyFilters(qb, query.filter);
    this.applyPagination(qb, query.pagination);
    this.applySorting(qb, query.sort, 'product.');

    return await qb.getMany();
  }

  /**
   * Finds a product by ID.
   *
   * @param id Product ID.
   * @param manager Optional transaction manager.
   * @returns The found product.
   * @throws CustomException if the product is not found.
   */
  async findOneById(id: string, manager?: EntityManager): Promise<Product> {
    const relations = ['cartItems', 'comments', 'orderItems'];
    return await this.findEntityById(id, relations, manager);
  }

  /**
   * Finds a product by name.
   *
   * @param name Product name.
   * @returns The found product.
   * @throws CustomException if the product is not found.
   */
  async findByName(name: string): Promise<Product | null> {
    try {
      return await this.productRepo.findOne({ where: { name } });
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0009_PRODUCT_NOT_FOUND, {
        data: { name },
        originalError: error,
      });
    }
  }

  /**
   * Updates a product by ID.
   *
   * @param id Product ID.
   * @param updateProductDto DTO for updating a product.
   * @param manager Optional transaction manager.
   * @returns The updated product.
   * @throws CustomException if there is an error updating the product.
   */
  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    manager?: EntityManager,
  ): Promise<Product> {
    const repo = manager ? manager.getRepository(Product) : this.productRepo;
    try {
      await repo.update(id, updateProductDto);
      return await this.findOneById(id, manager);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0007_PRODUCT_UPDATE_ERROR, {
        data: { id, updateProductDto },
        originalError: error,
      });
    }
  }

  /**
   * Deletes a product by ID.
   *
   * @param id Product ID.
   * @param manager Optional transaction manager.
   * @throws CustomException if there is an error deleting the product.
   */
  async removeProduct(id: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(Product) : this.productRepo;
    try {
      await this.findOneById(id, manager);
      await repo.delete(id);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0008_PRODUCT_REMOVE_ERROR, {
        data: { id },
        originalError: error,
      });
    }
  }

  /**
   * Saves a product.
   *
   * @param inputProduct Product to save.
   * @param manager Optional transaction manager.
   * @returns The saved product.
   * @throws CustomException if there is an error saving the product.
   */
  async saveProduct(
    inputProduct: Product,
    manager?: EntityManager,
  ): Promise<Product> {
    const product = ProductDTO.toEntity(inputProduct);
    try {
      return await this.saveEntity(product, manager);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(
        Errors.E_0006_PRODUCT_CREATION_ERROR,
        {
          data: { product },
          originalError: error,
        },
      );
    }
  }
}
