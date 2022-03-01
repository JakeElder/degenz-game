import dotenv from "dotenv";
import findConfig from "find-config";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import pg from "pg-connection-string";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const envFile = process.env.ENV_FILE || ".env";
dotenv.config({ path: findConfig(envFile)! });

let config: PostgresConnectionOptions;

const dir = __dirname.replace(/\/dist$/, "");

const base = {
  type: "postgres" as const,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [`${dir}/dist/app/entity/**/*.js`],
  migrations: [`${dir}/dist/app/migration/**/*.js`],
  cli: {
    migrationsDir: `${dir}/app/migration`,
  },
};

const env = process.env.NODE_ENV || "development";

if (env === "development") {
  config = {
    ...base,
    url: process.env.DATABASE_URL,
  };
} else {
  const db = pg.parse(process.env.DATABASE_URL!);
  config = {
    ...base,
    username: db.user,
    host: db.host!,
    database: db.database!,
    password: db.password,
    port: db.port ? parseInt(db.port, 10) : undefined,
    ssl: {
      ca: process.env.CA_CERT!.replace(/\\n/g, "\n"),
    },
  };
}

module.exports = config;
