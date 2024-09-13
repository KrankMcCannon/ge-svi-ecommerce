import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Comment } from './entities/comment.entity';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CartRepository } from './repositories/cart.repository';
import { CommentRepository } from './repositories/comment.repository';
import { ProductsRepository } from './repositories/products.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Cart, Comment])],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    CartRepository,
    CommentRepository,
  ],
})
export class ProductsModule {}
