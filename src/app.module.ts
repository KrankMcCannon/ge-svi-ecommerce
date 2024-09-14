import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './config/strategies/jwt-auth.guard';
import { TestDataSource } from './data-source-test';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { CartsModule } from './carts/carts.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        if (process.env.NODE_ENV === 'test') {
          if (!TestDataSource.isInitialized) {
            await TestDataSource.initialize();
          }
          return {
            ...TestDataSource.options,
          };
        } else {
          return {
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'password',
            database: 'ge-svi-ecommerce',
            entities: [__dirname + '/**/*.entity.{js,ts}'],
            migrations: [__dirname + '/migrations/*.{js,ts}'],
            synchronize: false,
            logging: true,
          };
        }
      },
    }),
    CartsModule,
    ProductsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
