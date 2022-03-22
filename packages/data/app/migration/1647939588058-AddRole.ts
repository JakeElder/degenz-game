import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRole1647939588058 implements MigrationInterface {
  name = "AddRole1647939588058";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."role_symbol_enum" AS ENUM('ADMIN', 'DEGEN', 'EVERYONE', 'PRISONER', 'SERVER_BOOSTER', 'VERIFIED', 'TRAINEE', 'ADMIN_BOT', 'ALLY_BOT', 'ARMORY_CLERK_BOT', 'BANKER_BOT', 'BIG_BROTHER_BOT', 'DEVILS_ADVOCATE_BOT', 'MART_CLERK_BOT', 'PRISONER_BOT', 'SCOUT_BOT', 'SENSEI_BOT', 'TOSSER_BOT', 'WARDEN_BOT', 'D1_CITIZEN', 'D2_CITIZEN', 'D3_CITIZEN', 'D4_CITIZEN', 'D5_CITIZEN', 'D6_CITIZEN', 'THE_LEFT_CITIZEN', 'THE_RIGHT_CITIZEN', 'THE_GRID_CITIZEN', 'BULLSEYE_CITIZEN', 'VULTURE_CITIZEN')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_type_enum" AS ENUM('BASE', 'CITIZEN', 'MANAGED')`
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" SERIAL NOT NULL, "symbol" "public"."role_symbol_enum" NOT NULL, "type" "public"."role_type_enum" NOT NULL, "discord_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_1dbd756868f1ae197268d66ebd3" UNIQUE ("symbol"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."persistent_message_maintainer_symbol_enum" RENAME TO "persistent_message_maintainer_symbol_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_maintainer_symbol_enum" AS ENUM('ADMIN', 'ALLY', 'ARMORY_CLERK', 'BANKER', 'BIG_BROTHER', 'DEVILS_ADVOCATE', 'MART_CLERK', 'PRISONER', 'SCOUT', 'SENSEI', 'TOSSER', 'WARDEN')`
    );
    await queryRunner.query(
      `ALTER TABLE "persistent_message" ALTER COLUMN "maintainer_symbol" TYPE "public"."persistent_message_maintainer_symbol_enum" USING "maintainer_symbol"::"text"::"public"."persistent_message_maintainer_symbol_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."persistent_message_maintainer_symbol_enum_old"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_maintainer_symbol_enum_old" AS ENUM('ADMIN', 'ALLY', 'ARMORY_CLERK', 'BANKER', 'BIG_BROTHER', 'DEVILS_ADVOCATE', 'MART_CLERK', 'PRISONER', 'SENSEI', 'TOSSER', 'WARDEN')`
    );
    await queryRunner.query(
      `ALTER TABLE "persistent_message" ALTER COLUMN "maintainer_symbol" TYPE "public"."persistent_message_maintainer_symbol_enum_old" USING "maintainer_symbol"::"text"::"public"."persistent_message_maintainer_symbol_enum_old"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."persistent_message_maintainer_symbol_enum"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."persistent_message_maintainer_symbol_enum_old" RENAME TO "persistent_message_maintainer_symbol_enum"`
    );
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TYPE "public"."role_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."role_symbol_enum"`);
  }
}
