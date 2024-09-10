import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    try {
      const product = this.productRepo.create(createProductDto);
      return await this.productRepo.save(product);
    } catch (error) {
      CustomLogger.error('Error creating product', error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async findAll(query: any, pagination: PaginationInfo): Promise<Product[]> {
    try {
      const qb = this.productRepo.createQueryBuilder('product');
      const pageNumber = pagination.pageNumber || 0;
      const pageSize = pagination.pageSize || 20;

      if (query.name) {
        qb.andWhere('product.name LIKE :name', { name: `%${query.name}%` });
      }

      qb.skip(pageNumber * pageSize);
      qb.take(pageSize);

      return qb.getMany();
    } catch (error) {
      CustomLogger.error('Error fetching products', error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async findOneById(id: number): Promise<Product> {
    try {
      return await this.productRepo.findOne({ where: { id } });
    } catch (error) {
      CustomLogger.error(`Error fetching product with ID ${id}`, error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      await this.productRepo.update(id, updateProductDto);
      return this.findOneById(id);
    } catch (error) {
      CustomLogger.error('Error updating product', error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }

  async removeProduct(id: number): Promise<void> {
    try {
      const product = await this.findOneById(id);
      await this.productRepo.remove(product);
    } catch (error) {
      CustomLogger.error(`Error removing product with ID ${id}`, error);
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, error);
    }
  }
}
