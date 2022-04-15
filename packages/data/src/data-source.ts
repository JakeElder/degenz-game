import dotenv from "dotenv";
import findConfig from "find-config";
import path from "path";
import { DataSource } from "typeorm";
import pg from "pg-connection-string";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { PostgresConnectionCredentialsOptions } from "typeorm/driver/postgres/PostgresConnectionCredentialsOptions";

const env = process.env.NODE_ENV || "development";

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

export default new DataSource({
  type: "postgres",
  namingStrategy: new SnakeNamingStrategy(),
  entities: [path.join(__dirname, "entity", "**", "*.js")],
  username: db.user,
  host: db.host!,
  database: db.database!,
  password: db.password,
  port: db.port ? parseInt(db.port, 10) : undefined,
  ssl,
});
