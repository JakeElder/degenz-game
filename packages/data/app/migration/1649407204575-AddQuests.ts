import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuests1649407204575 implements MigrationInterface {
  name = "AddQuests1649407204575";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."channel_type_enum" AS ENUM('QUEST_LOG_THREAD')`
    );
    await queryRunner.query(
      `CREATE TABLE "channel" ("id" SERIAL NOT NULL, "type" "public"."channel_type_enum" NOT NULL, "discord_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."quest_log_message_quest_enum" AS ENUM('PLEDGE', 'LEARN_TO_HACKER_BATTLE', 'TOSS_WITH_TED', 'SHOP_AT_MERRIS_MART', 'GET_WHITELIST')`
    );
    await queryRunner.query(
      `CREATE TABLE "quest_log_message" ("id" SERIAL NOT NULL, "quest" "public"."quest_log_message_quest_enum" NOT NULL, "discord_id" character varying NOT NULL, "expanded" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "quest_log_channel_id" integer, CONSTRAINT "PK_f2656e7fa0ca2f4b16a36e86885" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "quest_log_channel" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "channel_id" integer, "user_id" integer, CONSTRAINT "REL_c62fa0360b7904e5df0752b37d" UNIQUE ("channel_id"), CONSTRAINT "REL_1659c66f1478ed67a026b05a5a" UNIQUE ("user_id"), CONSTRAINT "PK_ce0227433c466218e5818108afb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "achievement" ADD "reward" integer NOT NULL DEFAULT '100'`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."achievement_symbol_enum" RENAME TO "achievement_symbol_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."achievement_symbol_enum" AS ENUM('HELP_REQUESTED', 'STATS_CHECKED', 'JOINED_THE_DEGENZ', 'SUPER_OBEDIENT', 'FINISHED_TRAINER', 'MART_STOCK_CHECKED', 'MART_ITEM_BOUGHT', 'ALLEGIANCE_PLEDGED', 'TOSS_COMPLETED')`
    );
    await queryRunner.query(
      `ALTER TABLE "achievement" ALTER COLUMN "symbol" TYPE "public"."achievement_symbol_enum" USING "symbol"::"text"::"public"."achievement_symbol_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."achievement_symbol_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."persistent_message_symbol_enum" RENAME TO "persistent_message_symbol_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_symbol_enum" AS ENUM('ENTRANCE', 'GBT_LEADERBOARD_1', 'GBT_LEADERBOARD_2', 'PLEDGE', 'SHOW_QUESTS')`
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
      `CREATE TYPE "public"."persistent_message_channel_symbol_enum" AS ENUM('ENTRANCE', 'QUESTS', 'ANNOUNCEMENTS', 'LEADERBOARD', 'COMMANDS', 'WHITELIST', 'FAQ', 'GENERAL', 'WELCOME_ROOM', 'FEEDBACK', 'HALL_OF_PRIVACY', 'TOWN_SQUARE', 'METRO', 'TAVERN', 'HALL_OF_ALLEIGANCE', 'MART', 'ARMORY', 'TOSS_HOUSE', 'BANK', 'ARENA', 'TRAINING_DOJO', 'GEN_POP')`
    );
    await queryRunner.query(
      `ALTER TABLE "persistent_message" ALTER COLUMN "channel_symbol" TYPE "public"."persistent_message_channel_symbol_enum" USING "channel_symbol"::"text"::"public"."persistent_message_channel_symbol_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."persistent_message_channel_symbol_enum_old"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."role_symbol_enum" RENAME TO "role_symbol_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_symbol_enum" AS ENUM('EVERYONE', 'VERIFIED', 'DEGEN', 'PRISONER', 'ESTABLISHMENT', 'ADMIN_BOT', 'ALLY_BOT', 'ARMORY_CLERK_BOT', 'BANKER_BOT', 'BIG_BROTHER_BOT', 'DEVILS_ADVOCATE_BOT', 'MART_CLERK_BOT', 'PRISONER_BOT', 'RESISTANCE_LEADER_BOT', 'SCOUT_BOT', 'SENSEI_BOT', 'TOSSER_BOT', 'WARDEN_BOT', 'ADMIN', 'SERVER_BOOSTER', 'TRAINEE', 'THOUGHT_POLICE', 'WHITELIST', 'D1_CITIZEN', 'D2_CITIZEN', 'D3_CITIZEN', 'D4_CITIZEN', 'D5_CITIZEN', 'D6_CITIZEN', 'THE_LEFT_CITIZEN', 'THE_RIGHT_CITIZEN', 'THE_GRID_CITIZEN', 'BULLSEYE_CITIZEN', 'VULTURE_CITIZEN')`
    );
    await queryRunner.query(
      `ALTER TABLE "role" ALTER COLUMN "symbol" TYPE "public"."role_symbol_enum" USING "symbol"::"text"::"public"."role_symbol_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."role_symbol_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."role_type_enum" RENAME TO "role_type_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_type_enum" AS ENUM('EVERYONE', 'BASE', 'CITIZEN', 'SUPPLEMENTARY', 'MANAGED')`
    );
    await queryRunner.query(
      `ALTER TABLE "role" ALTER COLUMN "type" TYPE "public"."role_type_enum" USING "type"::"text"::"public"."role_type_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."role_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "role" ALTER COLUMN "discord_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "quest_log_message" ADD CONSTRAINT "FK_56f6e6d162aa59a62d9d8a3d0f0" FOREIGN KEY ("quest_log_channel_id") REFERENCES "quest_log_channel"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "quest_log_channel" ADD CONSTRAINT "FK_c62fa0360b7904e5df0752b37d7" FOREIGN KEY ("channel_id") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "quest_log_channel" ADD CONSTRAINT "FK_1659c66f1478ed67a026b05a5a2" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quest_log_channel" DROP CONSTRAINT "FK_1659c66f1478ed67a026b05a5a2"`
    );
    await queryRunner.query(
      `ALTER TABLE "quest_log_channel" DROP CONSTRAINT "FK_c62fa0360b7904e5df0752b37d7"`
    );
    await queryRunner.query(
      `ALTER TABLE "quest_log_message" DROP CONSTRAINT "FK_56f6e6d162aa59a62d9d8a3d0f0"`
    );
    await queryRunner.query(
      `ALTER TABLE "role" ALTER COLUMN "discord_id" SET NOT NULL`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_type_enum_old" AS ENUM('BASE', 'CITIZEN', 'MANAGED', 'SUPPLEMENTARY')`
    );
    await queryRunner.query(
      `ALTER TABLE "role" ALTER COLUMN "type" TYPE "public"."role_type_enum_old" USING "type"::"text"::"public"."role_type_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."role_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."role_type_enum_old" RENAME TO "role_type_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_symbol_enum_old" AS ENUM('ADMIN', 'ADMIN_BOT', 'ALLY_BOT', 'ARMORY_CLERK_BOT', 'BANKER_BOT', 'BIG_BROTHER_BOT', 'BULLSEYE_CITIZEN', 'D1_CITIZEN', 'D2_CITIZEN', 'D3_CITIZEN', 'D4_CITIZEN', 'D5_CITIZEN', 'D6_CITIZEN', 'DEGEN', 'DEVILS_ADVOCATE_BOT', 'EVERYONE', 'MART_CLERK_BOT', 'PRISONER', 'PRISONER_BOT', 'SCOUT_BOT', 'SENSEI_BOT', 'SERVER_BOOSTER', 'THE_GRID_CITIZEN', 'THE_LEFT_CITIZEN', 'THE_RIGHT_CITIZEN', 'THOUGHT_POLICE', 'TOSSER_BOT', 'TRAINEE', 'VERIFIED', 'VULTURE_CITIZEN', 'WARDEN_BOT')`
    );
    await queryRunner.query(
      `ALTER TABLE "role" ALTER COLUMN "symbol" TYPE "public"."role_symbol_enum_old" USING "symbol"::"text"::"public"."role_symbol_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."role_symbol_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."role_symbol_enum_old" RENAME TO "role_symbol_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."persistent_message_channel_symbol_enum_old" AS ENUM('ADMIN_GENERAL', 'ADMIN_SANDBOX', 'ANNOUNCEMENTS', 'ARENA', 'ARMORY', 'BANK', 'COMMANDS', 'ENTER_THE_PROJECTS', 'ENTER_THE_SHELTERS', 'FAQ', 'FEEDBACK', 'GENERAL', 'GEN_POP', 'HALL_OF_ALLEIGANCE', 'HALL_OF_PRIVACY', 'LEADERBOARD', 'MART', 'METRO', 'ORIENTATION', 'TAVERN', 'TOSS_HOUSE', 'TOWN_SQUARE', 'TRAINING_DOJO', 'VERIFICATION', 'WAITING_ROOM', 'WELCOME_ROOM', 'WHITELIST')`
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
      `CREATE TYPE "public"."persistent_message_symbol_enum_old" AS ENUM('ENTRY', 'GBT_LEADERBOARD_1', 'GBT_LEADERBOARD_2', 'PLEDGE', 'THE_PROJECTS_ENTRY', 'THE_SHELTERS_ENTRY', 'VERIFY', 'WELCOME_INFO', 'WELCOME_NOTIFICATION')`
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
      `CREATE TYPE "public"."achievement_symbol_enum_old" AS ENUM('FINISHED_TRAINER', 'HELP_REQUESTED', 'JOINED_THE_DEGENZ', 'MART_ITEM_BOUGHT', 'MART_STOCK_CHECKED', 'STATS_CHECKED', 'SUPER_OBEDIENT')`
    );
    await queryRunner.query(
      `ALTER TABLE "achievement" ALTER COLUMN "symbol" TYPE "public"."achievement_symbol_enum_old" USING "symbol"::"text"::"public"."achievement_symbol_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."achievement_symbol_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."achievement_symbol_enum_old" RENAME TO "achievement_symbol_enum"`
    );
    await queryRunner.query(`ALTER TABLE "achievement" DROP COLUMN "reward"`);
    await queryRunner.query(`DROP TABLE "quest_log_channel"`);
    await queryRunner.query(`DROP TABLE "quest_log_message"`);
    await queryRunner.query(
      `DROP TYPE "public"."quest_log_message_quest_enum"`
    );
    await queryRunner.query(`DROP TABLE "channel"`);
    await queryRunner.query(`DROP TYPE "public"."channel_type_enum"`);
  }
}
