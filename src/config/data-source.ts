import { Cart, Comment, Product } from 'src/products/entities';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'your_password',
  database: 'ge-svi-ecommerce',
  entities: [Product, Cart, Comment],
  synchronize: true,
});
