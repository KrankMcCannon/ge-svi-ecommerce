import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../dtos';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    return await this.saveEntity(
      this.productRepo.create(createProductDto),
      'Product',
    );
  }

  async findAll(query: any, pagination: PaginationInfo): Promise<Product[]> {
    const qb = this.productRepo.createQueryBuilder('product');
    this.applyFilters(qb, query);
    this.applyPagination(qb, pagination);

    return await qb.getMany();
  }

  async findOneById(id: number): Promise<Product> {
    return this.findEntityById(id, 'Product');
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const result = await this.productRepo.update(id, updateProductDto);

      // Check if any rows were affected
      if (result.affected === 0) {
        throw CustomException.fromErrorEnum(Errors.E_0009_PRODUCT_NOT_FOUND, {
          errorDescription: 'Product not found',
        });
      }

      return await this.findOneById(id);
    } catch (error) {
      CustomLogger.error(`Error updating product with ID ${id}`, error);
      throw CustomException.fromErrorEnum(
        Errors.E_0007_PRODUCT_UPDATE_ERROR,
        error,
      );
    }
  }

  async removeProduct(id: number): Promise<void> {
    try {
      const product = await this.findOneById(id);
      if (!product) {
        throw CustomException.fromErrorEnum(Errors.E_0009_PRODUCT_NOT_FOUND, {
          errorDescription: 'Product not found',
        });
      }
      await this.productRepo.remove(product);
    } catch (error) {
      CustomLogger.error(`Error removing product with ID ${id}`, error);
      throw CustomException.fromErrorEnum(
        Errors.E_0008_PRODUCT_REMOVE_ERROR,
        error,
      );
    }
  }

  private async saveEntity(
    entity: Product,
    entityName: string,
  ): Promise<Product> {
    try {
      return await this.productRepo.save(entity);
    } catch (error) {
      CustomLogger.error(`Error saving ${entityName}`, error);
      throw CustomException.fromErrorEnum(
        Errors.E_0006_PRODUCT_CREATION_ERROR,
        error,
      );
    }
  }

  private applyFilters(qb: SelectQueryBuilder<Product>, query: any) {
    if (query.name) {
      qb.andWhere('product.name LIKE :name', { name: `%${query.name}%` });
    }
    if (query.category) {
      qb.andWhere('product.category = :category', { category: query.category });
    }
    if (query.priceRange) {
      qb.andWhere('product.price BETWEEN :min AND :max', {
        min: query.priceRange.min,
        max: query.priceRange.max,
      });
    }
  }

  private applyPagination(
    qb: SelectQueryBuilder<Product>,
    pagination: PaginationInfo,
  ) {
    const { pageNumber = 0, pageSize = 20 } = pagination;
    qb.skip(pageNumber * pageSize).take(pageSize);
  }

  private async findEntityById(
    id: number,
    entityName: string,
  ): Promise<Product> {
    try {
      const entity = await this.productRepo.findOne({ where: { id } });
      if (!entity) {
        throw CustomException.fromErrorEnum(Errors.E_0009_PRODUCT_NOT_FOUND, {
          errorDescription: `${entityName} not found.`,
        });
      }
      return entity;
    } catch (error) {
      CustomLogger.error(`Error fetching ${entityName} with ID ${id}`, error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }
}
