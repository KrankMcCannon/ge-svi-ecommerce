import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Cart } from './entities/cart.entity';
import { Comment } from './entities/comment.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { CartRepository } from './repositories/cart.repository';
import { CommentRepository } from './repositories/comment.repository';

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
