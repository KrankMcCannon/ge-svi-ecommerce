import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDataSource } from '../src/data-source-test';

describe('Application E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await TestDataSource.destroy();
  });

  afterEach(async () => {
    // Reset the database after each test
    for (const entity of TestDataSource.entityMetadatas) {
      const repository = TestDataSource.getRepository(entity.name);
      await repository.clear();
    }
  });

  describe('Products API', () => {
    it('should create a new product', async () => {
      const createProductDto = {
        name: 'E2E Test Product',
        description: 'E2E Test Description',
        price: 99.99,
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201);

      expect(response.body.data).toMatchObject({
        id: expect.any(String),
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
      });
    });
  });
});
