import { MigrationInterface, QueryRunner } from "typeorm";
import { MartItem } from "../entity/MartItem";

export class MartItemEnum1646835831348 implements MigrationInterface {
  name = "MartItemEnum1646835831348";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const martItems = await MartItem.find();
    await MartItem.delete({});

    await queryRunner.commitTransaction();
    await queryRunner.startTransaction();
    await queryRunner.query(
      `DROP INDEX "public"."IDX_65b80781585329c4d6148f7729"`
    );
    await queryRunner.query(`ALTER TABLE "mart_item" DROP COLUMN "symbol"`);
    await queryRunner.query(
      `CREATE TYPE "public"."mart_item_symbol_enum" AS ENUM('PIZZA', 'NOODLES', 'GRILLED_RAT')`
    );
    await queryRunner.query(
      `ALTER TABLE "mart_item" ADD "symbol" "public"."mart_item_symbol_enum" NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "mart_item" ADD CONSTRAINT "UQ_65b80781585329c4d6148f7729f" UNIQUE ("symbol")`
    );
    await queryRunner.commitTransaction();
    await MartItem.insert(martItems);
    await queryRunner.startTransaction();
    await queryRunner.query(
      `ALTER TYPE "public"."persistent_message_channel_symbol_enum" RENAME TO "persistent_message_channel_symbol_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_channel_symbol_enum" AS ENUM('VERIFICATION', 'ADMIN_GENERAL', 'ADMIN_SANDBOX', 'WELCOME_ROOM', 'ORIENTATION', 'WAITING_ROOM', 'ANNOUNCEMENTS', 'LEADERBOARD', 'COMMANDS', 'FAQ', 'GENERAL', 'FEEDBACK', 'HALL_OF_PRIVACY', 'TOWN_SQUARE', 'METRO', 'TAVERN', 'HALL_OF_ALLEIGANCE', 'MART', 'ARMORY', 'TOSS_HOUSE', 'BANK', 'ARENA', 'TRAINING_DOJO', 'GEN_POP')`
    );
    await queryRunner.query(
      `ALTER TABLE "persistent_message" ALTER COLUMN "channel_symbol" TYPE "public"."persistent_message_channel_symbol_enum" USING "channel_symbol"::"text"::"public"."persistent_message_channel_symbol_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."persistent_message_channel_symbol_enum_old"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_channel_symbol_enum_old" AS ENUM('VERIFICATION', 'ADMIN_GENERAL', 'ADMIN_SANDBOX', 'WELCOME_ROOM', 'WAITING_ROOM', 'ANNOUNCEMENTS', 'LEADERBOARD', 'COMMANDS', 'FAQ', 'GENERAL', 'FEEDBACK', 'HALL_OF_PRIVACY', 'TOWN_SQUARE', 'METRO', 'TAVERN', 'HALL_OF_ALLEIGANCE', 'MART', 'ARMORY', 'TOSS_HOUSE', 'BANK', 'ARENA', 'TRAINING_DOJO', 'GEN_POP')`
    );
    await queryRunner.query(
      `ALTER TABLE "persistent_message" ALTER COLUMN "channel_symbol" TYPE "public"."persistent_message_channel_symbol_enum_old" USING "channel_symbol"::"text"::"public"."persistent_message_channel_symbol_enum_old"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."persistent_message_channel_symbol_enum"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."persistent_message_channel_symbol_enum_old" RENAME TO "persistent_message_channel_symbol_enum"`
    );
    queryRunner.commitTransaction();
    const martItems = await MartItem.find();
    await MartItem.delete({});

    await queryRunner.startTransaction();
    await queryRunner.query(
      `ALTER TABLE "mart_item" DROP CONSTRAINT "UQ_65b80781585329c4d6148f7729f"`
    );
    await queryRunner.query(`ALTER TABLE "mart_item" DROP COLUMN "symbol"`);
    await queryRunner.query(`DROP TYPE "public"."mart_item_symbol_enum"`);
    await queryRunner.query(
      `ALTER TABLE "mart_item" ADD "symbol" character varying NOT NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_65b80781585329c4d6148f7729" ON "mart_item" ("symbol") `
    );
    await queryRunner.commitTransaction();
    await MartItem.insert(martItems);
    await queryRunner.startTransaction();
  }
}
