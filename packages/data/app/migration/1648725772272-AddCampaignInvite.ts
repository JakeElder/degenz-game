import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCampaignInvite1648725772272 implements MigrationInterface {
  name = "AddCampaignInvite1648725772272";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "campaign_invite" ("id" SERIAL NOT NULL, "discord_code" character varying NOT NULL, "campaign" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f463ab85c2d0d786f31881fcf6f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."persistent_message_channel_symbol_enum" RENAME TO "persistent_message_channel_symbol_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_channel_symbol_enum" AS ENUM('VERIFICATION', 'ADMIN_GENERAL', 'ADMIN_SANDBOX', 'WELCOME_ROOM', 'ORIENTATION', 'WAITING_ROOM', 'ENTER_THE_PROJECTS', 'ENTER_THE_SHELTERS', 'ANNOUNCEMENTS', 'LEADERBOARD', 'COMMANDS', 'WHITELIST', 'FAQ', 'GENERAL', 'FEEDBACK', 'HALL_OF_PRIVACY', 'TOWN_SQUARE', 'METRO', 'TAVERN', 'HALL_OF_ALLEIGANCE', 'MART', 'ARMORY', 'TOSS_HOUSE', 'BANK', 'ARENA', 'TRAINING_DOJO', 'GEN_POP')`
    );
    await queryRunner.query(
      `ALTER TABLE "persistent_message" ALTER COLUMN "channel_symbol" TYPE "public"."persistent_message_channel_symbol_enum" USING "channel_symbol"::"text"::"public"."persistent_message_channel_symbol_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."persistent_message_channel_symbol_enum_old"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."persistent_message_maintainer_symbol_enum" RENAME TO "persistent_message_maintainer_symbol_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_maintainer_symbol_enum" AS ENUM('ADMIN', 'ALLY', 'ARMORY_CLERK', 'BANKER', 'BIG_BROTHER', 'DEVILS_ADVOCATE', 'MART_CLERK', 'PRISONER', 'SCOUT', 'SENSEI', 'TOSSER', 'WARDEN', 'RESISTANCE_LEADER')`
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
      `CREATE TYPE "public"."persistent_message_maintainer_symbol_enum_old" AS ENUM('ADMIN', 'ALLY', 'ARMORY_CLERK', 'BANKER', 'BIG_BROTHER', 'DEVILS_ADVOCATE', 'MART_CLERK', 'PRISONER', 'SCOUT', 'SENSEI', 'TOSSER', 'WARDEN')`
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
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_channel_symbol_enum_old" AS ENUM('VERIFICATION', 'ADMIN_GENERAL', 'ADMIN_SANDBOX', 'WELCOME_ROOM', 'ORIENTATION', 'WAITING_ROOM', 'ENTER_THE_PROJECTS', 'ENTER_THE_SHELTERS', 'ANNOUNCEMENTS', 'LEADERBOARD', 'COMMANDS', 'FAQ', 'GENERAL', 'FEEDBACK', 'HALL_OF_PRIVACY', 'TOWN_SQUARE', 'METRO', 'TAVERN', 'HALL_OF_ALLEIGANCE', 'MART', 'ARMORY', 'TOSS_HOUSE', 'BANK', 'ARENA', 'TRAINING_DOJO', 'GEN_POP')`
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
    await queryRunner.query(`DROP TABLE "campaign_invite"`);
  }
}
