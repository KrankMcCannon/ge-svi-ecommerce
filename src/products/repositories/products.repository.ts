import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from '../dtos';
import { Product } from '../entities/product.entity';

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
    try {
      const qb = this.productRepo.createQueryBuilder('product');
      this.applyFilters(qb, query);
      this.applySorting(qb, query.sort);
      this.applyPagination(qb, pagination);
      return await qb.getMany();
    } catch (error) {
      CustomLogger.error('Error fetching products', error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async findOneById(id: string, manager?: EntityManager): Promise<Product> {
    return await this.findEntityById(id, 'Product', manager);
  }

  async findByName(name: string): Promise<Product | null> {
    try {
      return await this.productRepo.findOne({ where: { name } });
    } catch (error) {
      CustomLogger.error(`Error fetching product by name: ${name}`, error);
      throw CustomException.fromErrorEnum(
        Errors.E_0009_PRODUCT_NOT_FOUND,
        error,
      );
    }
  }

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
      CustomLogger.error(`Error updating product with ID ${id}`, error);
      throw CustomException.fromErrorEnum(
        Errors.E_0007_PRODUCT_UPDATE_ERROR,
        error,
      );
    }
  }

  async removeProduct(id: string, manager?: EntityManager): Promise<void> {
    try {
      const product = await this.findOneById(id, manager);
      if (!product) {
        throw CustomException.fromErrorEnum(Errors.E_0009_PRODUCT_NOT_FOUND, {
          errorDescription: 'Product not found',
        });
      }

      const repo = manager ? manager.getRepository(Product) : this.productRepo;

      // Check for associated records
      const associatedRecords = await repo
        .createQueryBuilder('product')
        .leftJoin('product.cartItems', 'cartItem')
        .leftJoin('product.comments', 'comment')
        .where('product.id = :id', { id })
        .andWhere('cartItem.id IS NOT NULL OR comment.id IS NOT NULL')
        .getOne();

      if (associatedRecords) {
        throw CustomException.fromErrorEnum(
          Errors.E_0010_PRODUCT_DELETE_CONSTRAINT,
          {
            errorDescription:
              'Product cannot be deleted due to associated records.',
          },
        );
      }

      await repo.delete(id);
    } catch (error) {
      if (error.code === '23503') {
        throw CustomException.fromErrorEnum(
          Errors.E_0010_PRODUCT_DELETE_CONSTRAINT,
          {
            errorDescription:
              'Product cannot be deleted due to associated records.',
          },
        );
      }
      CustomLogger.error(`Error removing product with ID ${id}`, error);
      throw CustomException.fromErrorEnum(
        Errors.E_0008_PRODUCT_REMOVE_ERROR,
        error,
      );
    }
  }

  async saveProduct(
    product: Product,
    manager?: EntityManager,
  ): Promise<Product> {
    const repo = manager ? manager.getRepository(Product) : this.productRepo;
    try {
      return await repo.save(product);
    } catch (error) {
      CustomLogger.error('Error saving product', error);
      throw error;
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

  private async findEntityById(
    id: string,
    entityName: string,
    manager?: EntityManager,
  ): Promise<Product> {
    const repo = manager ? manager.getRepository(Product) : this.productRepo;
    try {
      const entity = await repo.findOne({ where: { id } });
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

  private applyFilters(qb: SelectQueryBuilder<Product>, query: any) {
    if (query.name) {
      qb.andWhere('product.name ILIKE :name', { name: `%${query.name}%` });
    }
    if (query.category) {
      qb.andWhere('product.category = :category', { category: query.category });
    }
    if (query.minPrice && query.maxPrice) {
      qb.andWhere('product.price BETWEEN :min AND :max', {
        min: query.minPrice,
        max: query.maxPrice,
      });
    } else if (query.minPrice) {
      qb.andWhere('product.price >= :min', { min: query.minPrice });
    } else if (query.maxPrice) {
      qb.andWhere('product.price <= :max', { max: query.maxPrice });
    }
  }

  private applySorting(qb: SelectQueryBuilder<Product>, sort?: string) {
    if (sort) {
      const order = sort.startsWith('-') ? 'DESC' : 'ASC';
      const field = sort.startsWith('-') ? sort.substring(1) : sort;
      const validFields = [
        'name',
        'price',
        'category',
        'createdAt',
        'updatedAt',
      ];
      if (validFields.includes(field)) {
        qb.orderBy(`product.${field}`, order);
      }
    } else {
      qb.orderBy('product.createdAt', 'DESC');
    }
  }

  private applyPagination(
    qb: SelectQueryBuilder<Product>,
    pagination: PaginationInfo,
  ) {
    const { pageNumber = 0, pageSize = 20 } = pagination;
    qb.skip(pageNumber * pageSize).take(pageSize);
  }
}
