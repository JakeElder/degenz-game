import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDormitories1647429722438 implements MigrationInterface {
  name = "AddDormitories1647429722438";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."dormitory_symbol_enum" AS ENUM('THE_LEFT', 'THE_RIGHT', 'THE_GRID', 'BULLSEYE', 'VULTURE')`
    );
    await queryRunner.query(
      `CREATE TABLE "dormitory" ("id" SERIAL NOT NULL, "discord_channel_id" character varying, "symbol" "public"."dormitory_symbol_enum" NOT NULL, "active_emoji" character varying, "inactive_emoji" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_19aa4a06e235b989b769653b64a" UNIQUE ("symbol"), CONSTRAINT "PK_17483b11457c23cad87f30ff31c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "dormitory_tenancy" ("id" SERIAL NOT NULL, "bunk_thread_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "dormitory_id" integer, CONSTRAINT "PK_11c9c91e698c2a0e3e24a965bc7" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."apartment_tenancy_level_enum" AS ENUM('AUTHORITY', 'GUEST')`
    );
    await queryRunner.query(
      `CREATE TABLE "apartment_tenancy" ("id" SERIAL NOT NULL, "discord_channel_id" character varying NOT NULL, "level" "public"."apartment_tenancy_level_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "district_id" integer, "user_id" integer, CONSTRAINT "PK_21971d534efd48dd45221b8f3db" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "app_state" ADD "dormitory_capacity" integer NOT NULL DEFAULT '1'`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "dormitory_tenancy_id" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_df6585d92231eddbfe01ba5cfb3" UNIQUE ("dormitory_tenancy_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "mart_item" DROP CONSTRAINT "UQ_65b80781585329c4d6148f7729f"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."persistent_message_symbol_enum" RENAME TO "persistent_message_symbol_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_symbol_enum" AS ENUM('ENTRY', 'GBT_LEADERBOARD_1', 'GBT_LEADERBOARD_2', 'PLEDGE', 'THE_PROJECTS_ENTRY', 'THE_SHELTERS_ENTRY', 'VERIFY', 'WELCOME_INFO', 'WELCOME_NOTIFICATION')`
    );
    await queryRunner.query(
      `ALTER TABLE "persistent_message" ALTER COLUMN "symbol" TYPE "public"."persistent_message_symbol_enum" USING "symbol"::"text"::"public"."persistent_message_symbol_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."persistent_message_symbol_enum_old"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."persistent_message_channel_symbol_enum" RENAME TO "persistent_message_channel_symbol_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_channel_symbol_enum" AS ENUM('VERIFICATION', 'ADMIN_GENERAL', 'ADMIN_SANDBOX', 'WELCOME_ROOM', 'ORIENTATION', 'WAITING_ROOM', 'ENTER_THE_PROJECTS', 'ENTER_THE_SHELTERS', 'ANNOUNCEMENTS', 'LEADERBOARD', 'COMMANDS', 'FAQ', 'GENERAL', 'FEEDBACK', 'HALL_OF_PRIVACY', 'TOWN_SQUARE', 'METRO', 'TAVERN', 'HALL_OF_ALLEIGANCE', 'MART', 'ARMORY', 'TOSS_HOUSE', 'BANK', 'ARENA', 'TRAINING_DOJO', 'GEN_POP')`
    );
    await queryRunner.query(
      `ALTER TABLE "persistent_message" ALTER COLUMN "channel_symbol" TYPE "public"."persistent_message_channel_symbol_enum" USING "channel_symbol"::"text"::"public"."persistent_message_channel_symbol_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."persistent_message_channel_symbol_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "dormitory_tenancy" ADD CONSTRAINT "FK_8f96e7cc4373c578d6df1589b9a" FOREIGN KEY ("dormitory_id") REFERENCES "dormitory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_df6585d92231eddbfe01ba5cfb3" FOREIGN KEY ("dormitory_tenancy_id") REFERENCES "dormitory_tenancy"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "apartment_tenancy" ADD CONSTRAINT "FK_645fbba8a318fe98284be90e26e" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "apartment_tenancy" ADD CONSTRAINT "FK_65d49b98140bcfcb2f9a82c3d95" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "apartment_tenancy" DROP CONSTRAINT "FK_65d49b98140bcfcb2f9a82c3d95"`
    );
    await queryRunner.query(
      `ALTER TABLE "apartment_tenancy" DROP CONSTRAINT "FK_645fbba8a318fe98284be90e26e"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_df6585d92231eddbfe01ba5cfb3"`
    );
    await queryRunner.query(
      `ALTER TABLE "dormitory_tenancy" DROP CONSTRAINT "FK_8f96e7cc4373c578d6df1589b9a"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_channel_symbol_enum_old" AS ENUM('ADMIN_GENERAL', 'ADMIN_SANDBOX', 'ANNOUNCEMENTS', 'ARENA', 'ARMORY', 'BANK', 'COMMANDS', 'FAQ', 'FEEDBACK', 'GENERAL', 'GEN_POP', 'HALL_OF_ALLEIGANCE', 'HALL_OF_PRIVACY', 'LEADERBOARD', 'MART', 'METRO', 'ORIENTATION', 'TAVERN', 'TOSS_HOUSE', 'TOWN_SQUARE', 'TRAINING_DOJO', 'VERIFICATION', 'WAITING_ROOM', 'WELCOME_ROOM')`
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
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_symbol_enum_old" AS ENUM('ENTRY', 'GBT_LEADERBOARD_1', 'GBT_LEADERBOARD_2', 'PLEDGE', 'VERIFY', 'WELCOME_INFO', 'WELCOME_NOTIFICATION')`
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
      `ALTER TABLE "mart_item" ADD CONSTRAINT "UQ_65b80781585329c4d6148f7729f" UNIQUE ("symbol")`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_df6585d92231eddbfe01ba5cfb3"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "dormitory_tenancy_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "app_state" DROP COLUMN "dormitory_capacity"`
    );
    await queryRunner.query(`DROP TABLE "apartment_tenancy"`);
    await queryRunner.query(
      `DROP TYPE "public"."apartment_tenancy_level_enum"`
    );
    await queryRunner.query(`DROP TABLE "dormitory_tenancy"`);
    await queryRunner.query(`DROP TABLE "dormitory"`);
    await queryRunner.query(`DROP TYPE "public"."dormitory_symbol_enum"`);
  }
}
