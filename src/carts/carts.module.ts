import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { Cart } from './entities';
import { CartItem } from './entities/cartItem.entity';
import { CartItemRepository } from './repositories/cart-items.repository';
import { CartRepository } from './repositories/carts.repository';

@Module({
  imports: [
    UsersModule,
    ProductsModule,
    TypeOrmModule.forFeature([Cart, CartItem]),
  ],
  providers: [CartsService, CartRepository, CartItemRepository],
  controllers: [CartsController],
})
export class CartsModule {}
