import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CommentRepository } from './repositories/comments.repository';
import { ProductsRepository } from './repositories/products.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Comment])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, CommentRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
