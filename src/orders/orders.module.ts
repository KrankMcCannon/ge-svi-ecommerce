import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsModule } from 'src/carts/carts.module';
import { ProductsModule } from 'src/products/products.module';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderItemsRepository } from './repositories/order-items.repository';
import { OrdersRepository } from './repositories/orders.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CartsModule,
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, OrderItemsRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
