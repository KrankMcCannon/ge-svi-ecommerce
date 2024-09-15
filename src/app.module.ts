import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartsModule } from './carts/carts.module';
import { EnvironmentVariables } from './config/environment-variables';
import { JwtAuthGuard } from './config/strategies/jwt-auth.guard';
import { TestDataSource } from './data-source-test';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const isTestEnv = process.env.NODE_ENV === 'test';
        if (isTestEnv) {
          if (!TestDataSource.isInitialized) {
            await TestDataSource.initialize();
          }
          return {
            ...TestDataSource.options,
          };
        }

        return {
          type: 'postgres',
          host: EnvironmentVariables.DATABASE_HOST,
          port: EnvironmentVariables.DATABASE_PORT,
          username: EnvironmentVariables.DATABASE_USERNAME,
          password: EnvironmentVariables.DATABASE_PASSWORD,
          database: EnvironmentVariables.DATABASE_NAME,
          entities: [__dirname + '/**/*.entity.{js,ts}'],
          migrations: [__dirname + '/migrations/*.{js,ts}'],
          synchronize: false,
          logging: true,
        };
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
