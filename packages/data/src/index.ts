import dotenv from "dotenv";
import findConfig from "find-config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import pg from "pg-connection-string";
import { PostgresConnectionCredentialsOptions } from "typeorm/driver/postgres/PostgresConnectionCredentialsOptions";
import * as Entities from "./entity";

const env = process.env.APP_ENV || process.env.NODE_ENV || "development";

const envFile = {
  development: ".env",
  stage: ".env.stage",
  production: ".env.prod",
}[env];

dotenv.config({ path: findConfig(envFile)! });
const db = pg.parse(process.env.DATABASE_URL!);

const ssl: PostgresConnectionCredentialsOptions["ssl"] =
  env === "development" && !process.env.CA_CERT
    ? undefined
    : { ca: process.env.CA_CERT!.replace(/\\n/g, "\n") };

const dataSource = new DataSource({
  type: "postgres",
  namingStrategy: new SnakeNamingStrategy(),
  entities: Object.values(Entities),
  username: db.user,
  host: db.host!,
  database: db.database!,
  password: db.password,
  port: db.port ? parseInt(db.port, 10) : undefined,
  ssl,
});

async function connect() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
}

async function disconnect() {
  await dataSource.destroy();
}

export * from "./entity";
export { LEVELS as ENGAGEMENT_LEVELS } from "./entity/EngagementLevel";
export { connect, disconnect };

export default dataSource;
