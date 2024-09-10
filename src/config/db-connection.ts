export interface PostgresConnectionParams {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

export class PostgresConnectionCreator {
  static buildConnectionString(p: PostgresConnectionParams): string {
    return `postgres://${p.user}:${p.password}@${p.host}:${p.port}/${p.database}`;
  }
}
