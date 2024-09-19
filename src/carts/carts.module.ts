import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { Cart, CartItem } from './entities';
import { CartItemsRepository } from './repositories/cart-items.repository';
import { CartsRepository } from './repositories/carts.repository';

@Module({
  imports: [
    UsersModule,
    ProductsModule,
    TypeOrmModule.forFeature([Cart, CartItem]),
  ],
  providers: [CartsService, CartsRepository, CartItemsRepository],
  controllers: [CartsController],
  exports: [CartsService],
})
export class CartsModule {}
