import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1681509830286 implements MigrationInterface {
  name = 'InitialMigration1681509830286';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying NOT NULL,
        "role" character varying DEFAULT 'guest',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      );

      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "description" text NOT NULL,
        "price" float NOT NULL,
        "stock" int NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id")
      );

      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "author" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "productId" uuid,
        CONSTRAINT "PK_comments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_comments" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE
      );

      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid,
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_orders" FOREIGN KEY ("userId") REFERENCES "users" ("id")
      );

      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quantity" int NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "orderId" uuid,
        "productId" uuid,
        CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_order_items" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_order_items" FOREIGN KEY ("productId") REFERENCES "products" ("id")
      );

      CREATE TABLE "carts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid,
        CONSTRAINT "PK_carts_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_carts" FOREIGN KEY ("userId") REFERENCES "users" ("id")
      );

      CREATE TABLE "cart_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quantity" int NOT NULL,
        "price" float NOT NULL,
        "cartId" uuid,
        "productId" uuid,
        CONSTRAINT "PK_cart_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cart_cart_items" FOREIGN KEY ("cartId") REFERENCES "carts" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_cart_items" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "cart_items";
      DROP TABLE "carts";
      DROP TABLE "order_items";
      DROP TABLE "orders";
      DROP TABLE "comments";
      DROP TABLE "products";
      DROP TABLE "users";
    `);
  }
}
