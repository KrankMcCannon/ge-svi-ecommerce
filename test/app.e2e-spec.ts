import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AddCartItemToCartDto } from 'src/carts/dtos';
import { CreateProductDto } from 'src/products/dtos';
import { CreateUserDto } from 'src/users/dtos';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../src/app.module';

describe('Application E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdProductId: string;
  let createdCartItemId: string;
  let createdCommentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    await app.init();

    const user: CreateUserDto = {
      name: 'E2E Test User',
      email: 'e2e@user.com',
      password: 'Password123',
      role: 'admin',
    };

    // Register a new user to get an access token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    // Login to get an access token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(201);

    accessToken = loginResponse.body.data.access_token;

    // Create a product before all tests to use in various endpoints
    const createProductDto: CreateProductDto = {
      name: 'E2E Test Product',
      description: 'E2E Test Description',
      price: 99.99,
      stock: 10,
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createProductDto)
      .expect(201);

    createdProductId = response.body.data.id;
  });

  afterAll(async () => {
    // Clean up after all tests
    await request(app.getHttpServer())
      .delete(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await app.close();
  });

  // Helper functions
  async function createProduct(productDto: any): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(productDto)
      .expect(201);

    return response.body.data.id;
  }

  async function deleteProduct(productId: string): Promise<void> {
    await request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  }

  async function addProductToCart(
    addToCartDto: AddCartItemToCartDto,
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/carts/cart')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(addToCartDto)
      .expect(201);

    return response.body.data.id;
  }

  async function removeProductFromCart(cartItemId: string): Promise<void> {
    await request(app.getHttpServer())
      .delete(`/carts/cart/${cartItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  }

  async function addCommentToProduct(
    productId: string,
    content: string,
    author: string,
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/products/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId, content, author })
      .expect(201);

    return response.body.data.id;
  }

  describe('Products API', () => {
    // 1. POST /products - Create a new product
    describe('POST /products', () => {
      let newProductId: string;

      afterEach(async () => {
        if (newProductId) {
          await deleteProduct(newProductId);
          newProductId = undefined;
        }
      });

      it('should create a new product', async () => {
        const createProductDto = {
          name: 'E2E Test Product 2',
          description: 'E2E Test Description 2',
          price: 50.0,
          stock: 5,
        };

        newProductId = await createProduct(createProductDto);

        expect(newProductId).toBeDefined();
      });

      it('should not create a product with invalid data', async () => {
        const invalidProductDto = {
          description: 'Invalid Product',
          stock: -10,
        };

        const response = await request(app.getHttpServer())
          .post('/products')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidProductDto)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('name should not be empty');
        expect(response.body.message).toContain(
          'price must be a positive number',
        );
      });
    });

    // 2. GET /products - Get a list of products
    describe('GET /products', () => {
      it('should get a list of products', async () => {
        const response = await request(app.getHttpServer())
          .get('/products')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.list).toBeInstanceOf(Array);
        expect(response.body.list.length).toBeGreaterThan(0);
      });

      it('should return error for invalid pagination parameters', async () => {
        const response = await request(app.getHttpServer())
          .get('/products?pageNumber=-1&pageSize=abc')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain(
          'pageNumber must not be less than 0',
        );
        expect(response.body.message).toContain(
          'pageSize must be an integer number',
        );
      });
    });

    // 3. GET /products/:id - Get a product by ID
    describe('GET /products/:id', () => {
      it('should get a product by ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/${createdProductId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.data).toMatchObject({
          id: createdProductId,
          name: 'E2E Test Product',
        });
      });

      it('should return error for invalid product ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/products/invalid-id')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain(
          'Validation failed (uuid is expected)',
        );
      });

      it('should return error for non-existing product ID', async () => {
        const nonExistingId = uuidv4();
        const response = await request(app.getHttpServer())
          .get(`/products/${nonExistingId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });

    // 4. PATCH /products/:id - Update a product by ID
    describe('PATCH /products/:id', () => {
      it('should update a product by ID', async () => {
        const updateProductDto = {
          name: 'Updated E2E Test Product',
        };

        const response = await request(app.getHttpServer())
          .patch(`/products/${createdProductId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateProductDto)
          .expect(200);

        expect(response.body.data).toMatchObject({
          id: createdProductId,
          name: updateProductDto.name,
        });
      });

      it('should not update a product with invalid data', async () => {
        const invalidUpdateDto = {
          price: -50,
        };

        const response = await request(app.getHttpServer())
          .patch(`/products/${createdProductId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidUpdateDto)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain(
          'price must be a positive number',
        );
      });

      it('should return error when updating a non-existing product', async () => {
        const updateProductDto = {
          name: 'Non-existent Product',
        };
        const nonExistingId = uuidv4();

        const response = await request(app.getHttpServer())
          .patch(`/products/${nonExistingId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateProductDto)
          .expect(404);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });

    // 5. DELETE /products/:id - Delete a product by ID
    describe('DELETE /products/:id', () => {
      let productIdToDelete: string;

      beforeEach(async () => {
        const createProductDto = {
          name: 'Product to Delete',
          description: 'Product Description',
          price: 10.0,
          stock: 5,
        };

        productIdToDelete = await createProduct(createProductDto);
      });

      afterEach(async () => {
        if (productIdToDelete) {
          await deleteProduct(productIdToDelete);
          productIdToDelete = undefined;
        }
      });

      it('should delete a product by ID', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/products/${productIdToDelete}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.data).toBe(true);
        productIdToDelete = undefined;
      });

      it('should return error when deleting a non-existing product', async () => {
        const nonExistingId = uuidv4();

        const response = await request(app.getHttpServer())
          .delete(`/products/${nonExistingId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });

    // 6. POST /products/cart - Add a product to the cart
    describe('POST /products/cart', () => {
      let newProductId: string;
      beforeAll(async () => {
        const createProductDto = {
          name: 'E2E Test Product 2',
          description: 'E2E Test Description 2',
          price: 50.0,
          stock: 5,
        };

        newProductId = await createProduct(createProductDto);

        await request(app.getHttpServer())
          .post('/carts')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(201);
      });

      afterEach(async () => {
        if (createdCartItemId) {
          await removeProductFromCart(createdCartItemId);
          createdCartItemId = undefined;
        }
      });

      afterAll(async () => {
        if (newProductId) {
          await deleteProduct(newProductId);
          newProductId = undefined;
        }
      });

      it('should add a product to the cart', async () => {
        const createCartItemDto: AddCartItemToCartDto = {
          productId: newProductId,
          quantity: 2,
        };

        createdCartItemId = await addProductToCart(createCartItemDto);

        expect(createdCartItemId).toBeDefined();
      });

      it('should not add to cart if insufficient stock', async () => {
        const createCartItemDto: AddCartItemToCartDto = {
          productId: newProductId,
          quantity: 2,
        };

        const response = await request(app.getHttpServer())
          .post('/products/cart')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ ...createCartItemDto })
          .expect(409);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Insufficient stock');
      });

      it('should return error when adding to cart with invalid product ID', async () => {
        const response = await request(app.getHttpServer())
          .post('/products/cart')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ productId: 'invalid-id', quantity: 1 })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('productId must be a UUID');
      });
    });

    // 7. GET /products/cart/:id - Get cart items
    describe('GET /products/cart/:id', () => {
      let newProductId: string;
      beforeAll(async () => {
        const createProductDto = {
          name: 'E2E Test Product 2',
          description: 'E2E Test Description 2',
          price: 50.0,
          stock: 5,
        };

        newProductId = await createProduct(createProductDto);

        const createCartItemDto: AddCartItemToCartDto = {
          productId: newProductId,
          quantity: 2,
        };

        createdCartItemId = await addProductToCart(createCartItemDto);
      });

      afterAll(async () => {
        if (createdCartItemId) {
          await removeProductFromCart(createdCartItemId);
          createdCartItemId = undefined;
        }
        if (newProductId) {
          await deleteProduct(newProductId);
          newProductId = undefined;
        }
      });

      it('should get the cart items by cart ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/cart/${createdCartItemId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.list).toBeInstanceOf(Array);
        expect(response.body.list.length).toBeGreaterThan(0);
        expect(response.body.list[0]).toMatchObject({
          id: createdCartItemId,
          product: {
            id: createdProductId,
          },
        });
      });

      it('should return error when getting cart items with invalid cart ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/products/cart/invalid-id')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain(
          'Validation failed (uuid is expected)',
        );
      });

      it('should return error when getting cart items with non-existing cart ID', async () => {
        const nonExistingCartId = uuidv4();

        const response = await request(app.getHttpServer())
          .get(`/products/cart/${nonExistingCartId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });

    // 8. DELETE /products/cart/:id - Remove a product from the cart
    describe('DELETE /products/cart/:id', () => {
      const createCartItemDto: AddCartItemToCartDto = {
        productId: createdProductId,
        quantity: 2,
      };

      beforeEach(async () => {
        createdCartItemId = await addProductToCart(createCartItemDto);
      });

      afterEach(async () => {
        if (createdCartItemId) {
          await removeProductFromCart(createdCartItemId);
          createdCartItemId = undefined;
        }
      });

      it('should remove a product from the cart', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/products/cart/${createdCartItemId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.data).toBe(true);
        createdCartItemId = undefined;
      });

      it('should return error when removing a non-existing cart item', async () => {
        const nonExistingCartItemId = uuidv4();

        const response = await request(app.getHttpServer())
          .delete(`/products/cart/${nonExistingCartItemId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });

    // 9. POST /products/comments - Add a comment to a product
    describe('POST /products/comments', () => {
      it('should add a comment to a product', async () => {
        createdCommentId = await addCommentToProduct(
          createdProductId,
          'Great product!',
          'Test User',
        );

        expect(createdCommentId).toBeDefined();
      });

      it('should return error when adding a comment with invalid product ID', async () => {
        const response = await request(app.getHttpServer())
          .post('/products/comments')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            productId: 'invalid-id',
            content: 'Great product!',
            author: 'Test User',
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('productId must be a UUID');
      });

      it('should return error when adding a comment to non-existing product', async () => {
        const response = await request(app.getHttpServer())
          .post('/products/comments')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            productId: uuidv4(),
            content: 'Great product!',
            author: 'Test User',
          })
          .expect(404);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });

    // 10. GET /products/:id/comments - Get comments for a product
    describe('GET /products/:id/comments', () => {
      beforeAll(async () => {
        createdCommentId = await addCommentToProduct(
          createdProductId,
          'Great product!',
          'Test User',
        );
      });

      it('should get comments for a product', async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/${createdProductId}/comments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.list).toBeInstanceOf(Array);
        expect(response.body.list.length).toBeGreaterThan(0);
        expect(response.body.list[0]).toMatchObject({
          id: createdCommentId,
          content: 'Great product!',
          author: 'Test User',
        });
      });

      it('should return error when getting comments for invalid product ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/products/invalid-id/comments')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain(
          'Validation failed (uuid is expected)',
        );
      });

      it('should return error when getting comments for non-existing product', async () => {
        const nonExistingProductId = uuidv4();

        const response = await request(app.getHttpServer())
          .get(`/products/${nonExistingProductId}/comments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });
  });
});
