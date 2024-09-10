import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { AddToCartDto } from '../dtos';
import { Product } from '../entities/product.entity';
import { PaginationInfo } from 'src/config/pagination-info.dto';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
  ) {}

  async addToCart(addToCartDto: AddToCartDto, product: Product): Promise<Cart> {
    const cart = this.cartRepo.create({
      product,
      quantity: addToCartDto.quantity,
    });
    return this.cartRepo.save(cart);
  }

  async findCart(pagination: PaginationInfo): Promise<Cart[]> {
    const pageNumber = pagination.pageNumber || 0;
    const pageSize = pagination.pageSize || 20;
    const query = this.cartRepo
      .createQueryBuilder('cart')
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize);
    return query.getMany();
  }

  async findOneById(id: number): Promise<Cart> {
    return this.cartRepo.findOne({ where: { id } });
  }

  async removeCartItem(id: number): Promise<void> {
    await this.cartRepo.delete(id);
  }
}
