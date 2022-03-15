import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShelterEntryMessageSymbol1647146929196
  implements MigrationInterface
{
  name = "AddShelterEntryMessageSymbol1647146929196";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_65b80781585329c4d6148f7729"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."persistent_message_symbol_enum" RENAME TO "persistent_message_symbol_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_symbol_enum" AS ENUM('ENTRY', 'GBT_LEADERBOARD_1', 'GBT_LEADERBOARD_2', 'PLEDGE', 'SHELTER_ENTRY', 'VERIFY', 'WELCOME_INFO', 'WELCOME_NOTIFICATION')`
    );
    await queryRunner.query(
      `ALTER TABLE "persistent_message" ALTER COLUMN "symbol" TYPE "public"."persistent_message_symbol_enum" USING "symbol"::"text"::"public"."persistent_message_symbol_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."persistent_message_symbol_enum_old"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_symbol_enum_old" AS ENUM('WELCOME_INFO', 'WELCOME_NOTIFICATION', 'GBT_LEADERBOARD_1', 'GBT_LEADERBOARD_2', 'ENTRY', 'VERIFY', 'PLEDGE')`
    );
    await queryRunner.query(
      `ALTER TABLE "persistent_message" ALTER COLUMN "symbol" TYPE "public"."persistent_message_symbol_enum_old" USING "symbol"::"text"::"public"."persistent_message_symbol_enum_old"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."persistent_message_symbol_enum"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."persistent_message_symbol_enum_old" RENAME TO "persistent_message_symbol_enum"`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_65b80781585329c4d6148f7729" ON "mart_item" ("symbol") `
    );
  }
}
