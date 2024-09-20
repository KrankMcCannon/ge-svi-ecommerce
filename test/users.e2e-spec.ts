import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto, UpdateUserDto } from 'src/users/dtos';
import * as request from 'supertest';
import { DataSource, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../src/app.module';

describe('Users API E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdUserId: string;
  let queryRunner: QueryRunner;

  async function deleteAllTables() {
    const tables = ['users'];
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

    const adminUser: CreateUserDto = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPassword123',
      role: 'admin',
    };

    await request(app.getHttpServer())
      .post('/users')
      .send(adminUser)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminUser.email, password: adminUser.password })
      .expect(201);

    accessToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    await deleteAllTables();
    await queryRunner.release();
    await app.close();
  });

  // Helper functions
  async function createUser(userDto: CreateUserDto): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(userDto)
      .expect(201);

    return response.body.data.id;
  }

  describe('Users API', () => {
    // 1. POST /users - Create a new user
    describe('POST /users', () => {
      it('should create a new user', async () => {
        const createUserDto: CreateUserDto = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPassword123',
          role: 'user',
        };

        const response = await request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(201);

        createdUserId = response.body.data.id;
        expect(createdUserId).toBeDefined();
        expect(response.body.data.name).toBe(createUserDto.name);
        expect(response.body.data.email).toBe(createUserDto.email);
        expect(response.body.data).not.toHaveProperty('password');
      });

      it('should not create a user with invalid data', async () => {
        const invalidUserDto = {
          name: 'Invalid User',
          email: 'ex@mple.com',
          password: '123',
          role: 'user',
        };

        const response = await request(app.getHttpServer())
          .post('/users')
          .send(invalidUserDto)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain(
          'password must be longer than or equal to 6 characters',
        );
      });
    });

    // 2. GET /users/:id - Get a user by ID
    describe('GET /users/:id', () => {
      it('should get a user by ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${createdUserId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.data).toMatchObject({
          id: createdUserId,
          name: 'Test User',
          email: 'test@example.com',
        });
      });

      it('should return error for invalid user ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/invalid-id')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain(
          'Validation failed (uuid is expected)',
        );
      });

      it('should return error for non-existing user ID', async () => {
        const nonExistingId = uuidv4();
        const response = await request(app.getHttpServer())
          .get(`/users/${nonExistingId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });

    // 3. PATCH /users/:id - Update a user by ID
    describe('PATCH /users/:id', () => {
      it('should update a user by ID', async () => {
        const updateUserDto: UpdateUserDto = {
          name: 'Updated Test User',
        };

        const response = await request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateUserDto)
          .expect(200);

        expect(response.body.data).toMatchObject({
          id: createdUserId,
          name: updateUserDto.name,
        });
      });

      it('should not update a user with invalid data', async () => {
        const invalidUpdateDto = {
          email: 'invalid-email',
        };

        const response = await request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidUpdateDto)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('email must be an email');
      });

      it('should return error when updating a non-existing user', async () => {
        const updateUserDto: UpdateUserDto = {
          name: 'Non-existent User',
        };
        const nonExistingId = uuidv4();

        const response = await request(app.getHttpServer())
          .patch(`/users/${nonExistingId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateUserDto)
          .expect(404);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });

    // 4. DELETE /users/:id - Delete a user by ID
    describe('DELETE /users/:id', () => {
      let userIdToDelete: string;

      beforeEach(async () => {
        const createUserDto: CreateUserDto = {
          name: 'User to Delete',
          email: 'delete@example.com',
          password: 'DeletePassword123',
          role: 'user',
        };

        userIdToDelete = await createUser(createUserDto);
      });

      it('should delete a user by ID', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/users/${userIdToDelete}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.data).toBe(true);

        await request(app.getHttpServer())
          .get(`/users/${userIdToDelete}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });

      it('should return error when deleting a non-existing user', async () => {
        const nonExistingId = uuidv4();

        const response = await request(app.getHttpServer())
          .delete(`/users/${nonExistingId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('data');
        expect(response.body.errorDescription).toContain('Not Found');
      });
    });
  });
});
