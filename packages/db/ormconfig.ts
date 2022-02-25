import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import pg from "pg-connection-string";
import Config from "app-config";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

let config: PostgresConnectionOptions;

const base = {
  type: "postgres" as const,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [`${__dirname}/dist/app/entity/**/*.js`],
};

if (Config.env("NODE_ENV") === "development") {
  config = {
    ...base,
    url: Config.env("DATABASE_URL"),
    synchronize: true,
  };
} else {
  const db = pg.parse(Config.env("DATABASE_URL"));
  config = {
    ...base,
    username: db.user,
    host: db.host!,
    database: db.database!,
    password: db.password,
    port: db.port ? parseInt(db.port, 10) : undefined,
    ssl: {
      ca: Config.env("CA_CERT")!.replace(/\\n/g, "\n"),
    },
  };
}

module.exports = config;
