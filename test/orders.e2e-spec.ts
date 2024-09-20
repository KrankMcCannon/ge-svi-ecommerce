import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductDto } from 'src/products/dtos';
import { CreateUserDto } from 'src/users/dtos';
import * as request from 'supertest';
import { DataSource, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../src/app.module';
import { OrderStatus } from '../src/orders/enum';

describe('Orders API E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let productId: string;
  let orderId: string;
  let queryRunner: QueryRunner;

  async function deleteAllTables() {
    const tables = [
      'order_items',
      'orders',
      'cart_items',
      'carts',
      'products',
      'users',
    ];
    for (const table of tables) {
      await queryRunner.query(`DELETE FROM "${table}";`);
    }
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    await deleteAllTables();

    const user: CreateUserDto = {
      name: 'E2E Cart Test User',
      email: 'e2e@cartuser.com',
      password: 'Password123',
      role: 'admin',
    };

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    userId = registerResponse.body.data.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(201);

    accessToken = loginResponse.body.data.access_token;

    // Create a product
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 10.99,
      stock: 100,
    };

    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createProductDto)
      .expect(201);

    productId = productResponse.body.data.id;

    // Add product to cart
    await request(app.getHttpServer())
      .post('/carts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId, quantity: 2 })
      .expect(201);
  });

  afterAll(async () => {
    await deleteAllTables();
    await queryRunner.release();
    await app.close();
  });

  describe('Orders API', () => {
    // 1. POST /orders/checkout - Checkout the cart and make the order
    describe('POST /orders', () => {
      it('should checkout the cart and create an order', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders/checkout')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(201);

        orderId = response.body.data.id;
        expect(orderId).toBeDefined();
        expect(response.body.data.status).toBe(OrderStatus.CREATED);
        expect(response.body.data.user.id).toBe(userId);
      });

      it('should return error when checking out an empty cart', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders/checkout')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('errorDescription');
        expect(response.body.errorDescription).toContain('Cart not found');
      });
    });

    // 2. GET /orders - Get all orders for the user
    describe('GET /orders', () => {
      it('should get all orders for the user', async () => {
        const response = await request(app.getHttpServer())
          .get('/orders')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.list).toBeInstanceOf(Array);
      });

      it('should return orders with pagination', async () => {
        const response = await request(app.getHttpServer())
          .get('/orders?pageNumber=1&pageSize=10')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.list).toBeInstanceOf(Array);
      });
    });

    // 3. GET /orders/:id - Get an order by id
    describe('GET /orders/:id', () => {
      it('should get an order by id', async () => {
        const response = await request(app.getHttpServer())
          .get(`/orders/${orderId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.data.id).toBe(orderId);
        expect(response.body.data.status).toBe(OrderStatus.CREATED);
        expect(response.body.data.user.id).toBe(userId);
      });

      it('should return error for invalid order ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/orders/invalid-id')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(500);

        expect(response.body).toHaveProperty('errorDescription');
        expect(response.body.errorDescription).toContain(
          'Internal Server Error',
        );
      });

      it('should return error for non-existing order ID', async () => {
        const nonExistingId = uuidv4();
        const response = await request(app.getHttpServer())
          .get(`/orders/${nonExistingId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('errorDescription');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });
  });
});
