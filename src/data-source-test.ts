import { join } from 'path';
import { DataSource } from 'typeorm';

export const TestDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'user_test',
  password: 'user_test_password',
  database: 'ge-svi-ecommerce-test',
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: true,
  dropSchema: true,
  logging: false,
});
