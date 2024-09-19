import { config } from 'dotenv';
config();

function __getNumberWithDefault(
  param: string | undefined,
  def?: number,
): number {
  return Number(param || def);
}

function __getStringWithDefault(
  param: string | undefined,
  def: string,
): string {
  return param || def;
}

export class EnvironmentVariables {
  /**
   * Node environment
   * Default: 'development'
   * @returns {string} The node environment (NODE_ENV)
   */
  static get NODE_ENV(): string {
    return __getStringWithDefault(process.env.NODE_ENV, 'development');
  }

  /**
   * Application port
   * Default: 3000
   * @returns {number} The port the application will run on (PORT)
   */
  static get PORT(): number {
    return __getNumberWithDefault(process.env.PORT, 3000);
  }

  /**
   * IP address to bind the server
   * Default: '0.0.0.0'
   * @returns {string} The IP address to run the application (IP)
   */
  static get IP(): string {
    return __getStringWithDefault(process.env.IP, '0.0.0.0');
  }

  /**
   * JWT secret key
   * @returns {string} The secret key for JWT (JWT_SECRET)
   */
  static get JWT_SECRET(): string {
    return process.env.JWT_SECRET!;
  }

  /**
   * JWT expiration time
   * Default: '1d'
   * @returns {string} The expiration time for JWT (JWT_EXPIRATION_TIME)
   */
  static get JWT_EXPIRATION_TIME(): string {
    return __getStringWithDefault(process.env.JWT_EXPIRATION_TIME, '1d');
  }

  /**
   * PostgreSQL protocol
   * Default: 'postgres'
   * @returns {string} The database protocol (DATABASE_PROTOCOL)
   */
  static get DATABASE_PROTOCOL(): string {
    return __getStringWithDefault(process.env.DATABASE_PROTOCOL, 'postgres');
  }

  /**
   * PostgreSQL database host
   * Default: 'localhost'
   * @returns {string} The database host (DATABASE_HOST)
   */
  static get DATABASE_HOST(): string {
    return __getStringWithDefault(process.env.DATABASE_HOST, 'localhost');
  }

  /**
   * PostgreSQL database port
   * Default: 5432
   * @returns {number} The database port (DATABASE_PORT)
   */
  static get DATABASE_PORT(): number {
    return __getNumberWithDefault(process.env.DATABASE_PORT, 5432);
  }

  /**
   * PostgreSQL database name
   * Default: 'ge-svi-ecommerce'
   * @returns {string} The name of the database (DATABASE_NAME)
   */
  static get DATABASE_NAME(): string {
    return __getStringWithDefault(
      process.env.DATABASE_NAME,
      'ge-svi-ecommerce',
    );
  }

  /**
   * PostgreSQL database username
   * Default: 'postgres'
   * @returns {string} The database username (DATABASE_USERNAME)
   */
  static get DATABASE_USERNAME(): string {
    return __getStringWithDefault(process.env.DATABASE_USERNAME, 'postgres');
  }

  /**
   * PostgreSQL database password
   * @returns {string} The database password (DATABASE_PASSWORD)
   */
  static get DATABASE_PASSWORD(): string {
    return process.env.DATABASE_PASSWORD!;
  }

  /**
   * Title for Swagger documentation
   * Default: 'GE SVI Ecommerce API'
   * @returns {string} The title for Swagger documentation (SWAGGER_TITLE)
   */
  static get SWAGGER_TITLE(): string {
    return __getStringWithDefault(
      process.env.SWAGGER_TITLE,
      'GE SVI Ecommerce API',
    );
  }

  /**
   * Description for Swagger documentation
   * Default: 'API documentation for E-commerce'
   * @returns {string} The description for Swagger documentation (SWAGGER_DESCRIPTION)
   */
  static get SWAGGER_DESCRIPTION(): string {
    return __getStringWithDefault(
      process.env.SWAGGER_DESCRIPTION,
      'API documentation for E-commerce',
    );
  }

  /**
   * Version of the Swagger documentation
   * Default: '1.0.0'
   * @returns {string} The version for Swagger documentation (SWAGGER_APP_VERSION)
   */
  static get SWAGGER_APP_VERSION(): string {
    return __getStringWithDefault(process.env.SWAGGER_APP_VERSION, '1.0.0');
  }

  /**
   * Default pagination size
   * Default: 20
   * @returns {number} The number of elements per page (DEFAULT_PAGINATION_PAGE_SIZE)
   */
  static get DEFAULT_PAGINATION_PAGE_SIZE(): number {
    return __getNumberWithDefault(process.env.DEFAULT_PAGINATION_PAGE_SIZE, 20);
  }
}
