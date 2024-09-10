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
   * Default: 'test'
   * @returns {string} The name of the database (DATABASE_NAME)
   */
  static get DATABASE_NAME(): string {
    return __getStringWithDefault(process.env.DATABASE_NAME, 'test');
  }

  /**
   * Title for Swagger documentation
   * Default: 'E-commerce API'
   * @returns {string} The title for Swagger documentation (SWAGGER_TITLE)
   */
  static get SWAGGER_TITLE(): string {
    return process.env.SWAGGER_TITLE || 'GE SVI Ecommerce API';
  }

  /**
   * Description for Swagger documentation
   * Default: 'API documentation for E-commerce'
   * @returns {string} The description for Swagger documentation (SWAGGER_DESCRIPTION)
   */
  static get SWAGGER_DESCRIPTION(): string {
    return (
      process.env.SWAGGER_DESCRIPTION || 'API documentation for E-commerce'
    );
  }

  /**
   * Version of the Swagger documentation
   * Default: '1.0.0'
   * @returns {string} The version for Swagger documentation (SWAGGER_APP_VERSION)
   */
  static get SWAGGER_APP_VERSION(): string {
    return process.env.SWAGGER_APP_VERSION || '1.0.0';
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
