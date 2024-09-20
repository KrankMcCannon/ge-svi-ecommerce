import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AddCartItemToCartDto } from 'src/carts/dtos';
import { CreateProductDto } from 'src/products/dtos';
import { CreateUserDto } from 'src/users/dtos';
import * as request from 'supertest';
import { DataSource, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../src/app.module';

describe('Carts E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdProductId: string;
  let createdCartItemId: string;
  let queryRunner: QueryRunner;

  async function deleteAllTables() {
    const tables = [
      'cart_items',
      'carts',
      'comments',
      'order_items',
      'orders',
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

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(201);

    accessToken = loginResponse.body.data.access_token;

    const createProductDto: CreateProductDto = {
      name: 'E2E Cart Test Product',
      description: 'Cart Test Description',
      price: 50.0,
      stock: 100,
    };

    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createProductDto)
      .expect(201);

    createdProductId = productResponse.body.data.id;
  });

  afterAll(async () => {
    await deleteAllTables();
    await queryRunner.release();
    await app.close();
  });

  // Helper functions
  async function addProductToCart(
    addToCartDto: AddCartItemToCartDto,
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/carts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(addToCartDto)
      .expect(201);

    return response.body.data.id;
  }

  async function removeProductFromCart(cartItemId: string): Promise<void> {
    await request(app.getHttpServer())
      .delete(`/carts/${cartItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  }

  describe('Cart API', () => {
    // 1. POST /carts - Add product to cart
    describe('POST /carts/cart', () => {
      afterEach(async () => {
        if (createdCartItemId) {
          await removeProductFromCart(createdCartItemId);
          createdCartItemId = undefined;
        }
      });

      it('should add a product to the cart', async () => {
        const addToCartDto: AddCartItemToCartDto = {
          productId: createdProductId,
          quantity: 1,
        };

        createdCartItemId = await addProductToCart(addToCartDto);

        expect(createdCartItemId).toBeDefined();
      });

      it('should not add a product to the cart with invalid data', async () => {
        const invalidAddToCartDto = {
          productId: 'invalid-id',
          quantity: 0,
        };

        const response = await request(app.getHttpServer())
          .post('/carts')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidAddToCartDto)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain(
          'quantity must be a positive number',
        );
        expect(response.body.message).toContain('productId must be a UUID');
      });
    });

    // 2. GET /carts - Get cart items
    describe('GET /carts/:id/items', () => {
      beforeAll(async () => {
        const addToCartDto: AddCartItemToCartDto = {
          productId: createdProductId,
          quantity: 2,
        };
        createdCartItemId = await addProductToCart(addToCartDto);
      });

      afterAll(async () => {
        if (createdCartItemId) {
          await removeProductFromCart(createdCartItemId);
          createdCartItemId = undefined;
        }
      });

      it('should get the cart items', async () => {
        const response = await request(app.getHttpServer())
          .get(`/carts/${createdCartItemId}/items`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.list).toBeInstanceOf(Array);
      });
    });

    // 3. PATCH /carts/:id - Update product quantity in cart
    describe('PATCH /carts', () => {
      beforeEach(async () => {
        const addToCartDto: AddCartItemToCartDto = {
          productId: createdProductId,
          quantity: 1,
        };
        createdCartItemId = await addProductToCart(addToCartDto);
      });

      afterEach(async () => {
        if (createdCartItemId) {
          await removeProductFromCart(createdCartItemId);
          createdCartItemId = undefined;
        }
      });

      it('should update the product quantity in the cart', async () => {
        const addToCartDto: AddCartItemToCartDto = {
          productId: createdProductId,
          quantity: 1,
        };
        const response = await request(app.getHttpServer())
          .patch('/carts')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(addToCartDto)
          .expect(200);

        expect(response.body.data.cartItems[0].quantity).toEqual(1);
      });

      it('should return error for invalid quantity', async () => {
        const addToCartDto: AddCartItemToCartDto = {
          productId: createdProductId,
          quantity: 0,
        };
        const response = await request(app.getHttpServer())
          .patch('/carts')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(addToCartDto)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain(
          'quantity must be a positive number',
        );
      });
    });

    // 4. DELETE /carts/:id - Remove a product from the cart
    describe('DELETE /carts/:id', () => {
      beforeEach(async () => {
        const addToCartDto: AddCartItemToCartDto = {
          productId: createdProductId,
          quantity: 2,
        };
        createdCartItemId = await addProductToCart(addToCartDto);
      });

      it('should remove a product from the cart', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/carts/${createdCartItemId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.data).toBe(true);
        createdCartItemId = undefined;
      });

      it('should return error when removing a non-existing cart item', async () => {
        const nonExistingCartItemId = uuidv4();

        const response = await request(app.getHttpServer())
          .delete(`/carts/${nonExistingCartItemId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });
  });
});
