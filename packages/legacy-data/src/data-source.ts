import path from "path";
import { DataSource } from "typeorm";
import pg from "pg-connection-string";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { PostgresConnectionCredentialsOptions } from "typeorm/driver/postgres/PostgresConnectionCredentialsOptions";

const db = pg.parse(
  "postgresql://degenz-discord-prod:3zibKjic7mugPUaQ@db-postgresql-sgp1-43466-do-user-10660259-0.b.db.ondigitalocean.com:25060/degenz_prod_2?sslmode=require"
);

const CA_CERT =
  "-----BEGIN CERTIFICATE-----\nMIIEQTCCAqmgAwIBAgIUQorrhTgs27IvkDhf3MT0xWGNsggwDQYJKoZIhvcNAQEM\nBQAwOjE4MDYGA1UEAwwvNmVjMmJkMTMtMDJiOC00NWU0LTg3ZDktYTRlZmVlMzFm\nMmFlIFByb2plY3QgQ0EwHhcNMjIwMjIxMTMwOTI1WhcNMzIwMjE5MTMwOTI1WjA6\nMTgwNgYDVQQDDC82ZWMyYmQxMy0wMmI4LTQ1ZTQtODdkOS1hNGVmZWUzMWYyYWUg\nUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAMgJxi1U\ngTAZufq31COr3Pl5qWYyf9UX/AnCzQUS8pVfN77OS+LsnPQeGyFZIBLLa/5EXWZZ\nxLn+TvdGfIlgdmW7HAL/SG3BQs3qcmS4XleCiQ2I0IaXIe7p8MEuqJo8NOpPY4SQ\nmm8KUMVRZEYmv2ixJA8naq+Ejwkny+oLhqiZquBd9oqPRYdvQcJIOx52ohYdlDF7\nwg/lurpgOo6gV/KVLDao3ShpGCa8qEDZv772OCz9p5YSqX9d7AS7bYA42Q/BrhJ0\nQiW7KbhArWtj6bECZE+3TOk7dEY/CQgbxDyYp3+EOpimN1dRV2aL9J4GGZZAqB43\nsNabeO1HZAInMvP1c0vhIPn/o+YAz0zcU7YuLXdwzqwRu+vLZWW+3egtnczjSBF8\nbfKEi/y9wMM5+Hi1PhBZ7hU3NlQVx25z00ZNbVaPqOaYkhhwH058E82UBpbsppYn\nv3j7aLmFkyT6i9nLlmODjvqqWbgaiAV99A3G+9TlDunrcoZ+jBzQvsRs1QIDAQAB\noz8wPTAdBgNVHQ4EFgQUXMtDy0+Ghz1JzQjnOe1OnaiNKrgwDwYDVR0TBAgwBgEB\n/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAIS7XIKA6WUepFsA\n3KGftTgqwUOCWrVKfgW0sjcwDAY5DhxkxFJkf3y+d+/m1p3OMSRz42zwj3Xb/dSn\nwbbsYknuJ2z0gPRc3R11IV7pF7EtPM6uqT14ZUG3B+BWSEEDerhpovChJd6yx7Hp\nz+AlcuuxSKx4s/XL6XNTDcFt3cePlq1sY1k5WiGSNTfE/WDD5nVrYO8YpYS3KQ3c\n7X+wpCV5lMneG3vOKj2Ctz7jWflqIqcbgATx/jXn7OKgymXGdwt6iEmS//LfKE+3\nW/Ld6MjIcvxxsj5kWRjfigiuCnHY3gp68bvUoyBJPfICX7Dq6mJQmZnSqGatx6jQ\ngXyGORWi/YbrEPcKmm8JCrNT9WBJc4rlViRJGFTlrjtGq9AJFPyg1SwXrSAM5HR3\n2I3Vv+PHsraQsmh11cMWwwvy+AbVv1MK0a07bpSuSMeEYxT6tSnCB9BkwZqZCgfV\nIfLiMs7TwNxJTOwU5mtOemEBbB4tB7kQ3fXOaFqZAcOHXSobKw==\n-----END CERTIFICATE-----";

const ssl: PostgresConnectionCredentialsOptions["ssl"] = {
  ca: CA_CERT.replace(/\\n/g, "\n"),
};

export default new DataSource({
  type: "postgres",
  namingStrategy: new SnakeNamingStrategy(),
  entities: [path.join(__dirname, "entity", "**", "*.ts")],
  username: db.user,
  host: db.host!,
  database: db.database!,
  password: db.password,
  port: db.port ? parseInt(db.port, 10) : undefined,
  ssl,
});
