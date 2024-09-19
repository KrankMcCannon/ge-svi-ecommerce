import { DataSource } from 'typeorm';
import { EnvironmentVariables } from './config/environment-variables';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'ge-svi-ecommerce',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: EnvironmentVariables.NODE_ENV === 'development',
  logging: true,
});
