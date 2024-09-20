import { DataSource } from 'typeorm';
import { EnvironmentVariables } from './config/environment-variables';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: EnvironmentVariables.DATABASE_HOST,
  port: EnvironmentVariables.DATABASE_PORT,
  username: EnvironmentVariables.DATABASE_USERNAME,
  password: EnvironmentVariables.DATABASE_PASSWORD,
  database: EnvironmentVariables.DATABASE_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: EnvironmentVariables.NODE_ENV === 'development',
  logging: true,
});
