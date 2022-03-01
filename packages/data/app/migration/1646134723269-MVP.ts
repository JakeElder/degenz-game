import {MigrationInterface, QueryRunner} from "typeorm";

export class MVP1646134723269 implements MigrationInterface {
    name = 'MVP1646134723269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."achievement_symbol_enum" AS ENUM('HELP_REQUESTED', 'STATS_CHECKED', 'JOINED_THE_DEGENZ', 'SUPER_OBEDIENT', 'FINISHED_TRAINER', 'MART_STOCK_CHECKED', 'MART_ITEM_BOUGHT')`);
        await queryRunner.query(`CREATE TABLE "achievement" ("id" SERIAL NOT NULL, "symbol" "public"."achievement_symbol_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7db8948a0b7e294b1485a61f83a" UNIQUE ("symbol"), CONSTRAINT "PK_441339f40e8ce717525a381671e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app_state" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9df845dddbe048ab254b63b811d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "imprisonment" ("id" SERIAL NOT NULL, "entry_role_ids" jsonb NOT NULL DEFAULT '[]', "reason" character varying, "cell_number" integer NOT NULL, "cell_discord_channel_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" integer, CONSTRAINT "UQ_1e41f9927af9470160a5040c7dc" UNIQUE ("cell_discord_channel_id"), CONSTRAINT "PK_ed10a3c4c5f97dc376e50bc9dd6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mart_item" ("id" SERIAL NOT NULL, "symbol" character varying NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "price" integer NOT NULL, "stock" integer NOT NULL, "strength_increase" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0418e65c7a25b3f3d3b8d19b432" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_65b80781585329c4d6148f7729" ON "mart_item" ("symbol") `);
        await queryRunner.query(`CREATE TABLE "mart_item_ownership" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" integer, "item_id" integer, CONSTRAINT "PK_99284104433c154554a80f88b1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "npc" ("id" SERIAL NOT NULL, "symbol" character varying NOT NULL, "default_emoji_id" character varying, "enabled" boolean DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f88acee050bfea2111b399ab49b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_50003c20dc6b7f3e5b0a160bfe" ON "npc" ("symbol") `);
        await queryRunner.query(`CREATE TYPE "public"."persistent_message_symbol_enum" AS ENUM('WELCOME_INFO', 'WELCOME_NOTIFICATION', 'GBT_LEADERBOARD_1', 'GBT_LEADERBOARD_2', 'ENTRY', 'VERIFY', 'PLEDGE')`);
        await queryRunner.query(`CREATE TYPE "public"."persistent_message_channel_symbol_enum" AS ENUM('VERIFICATION', 'ADMIN_GENERAL', 'ADMIN_SANDBOX', 'WELCOME_ROOM', 'WAITING_ROOM', 'ANNOUNCEMENTS', 'LEADERBOARD', 'COMMANDS', 'FAQ', 'GENERAL', 'FEEDBACK', 'HALL_OF_PRIVACY', 'TOWN_SQUARE', 'METRO', 'TAVERN', 'HALL_OF_ALLEIGANCE', 'MART', 'ARMORY', 'TOSS_HOUSE', 'BANK', 'ARENA', 'TRAINING_DOJO', 'GEN_POP')`);
        await queryRunner.query(`CREATE TYPE "public"."persistent_message_maintainer_symbol_enum" AS ENUM('ADMIN', 'ALLY', 'ARMORY_CLERK', 'BANKER', 'BIG_BROTHER', 'DEVILS_ADVOCATE', 'MART_CLERK', 'PRISONER', 'SENSEI', 'TOSSER', 'WARDEN')`);
        await queryRunner.query(`CREATE TABLE "persistent_message" ("id" SERIAL NOT NULL, "symbol" "public"."persistent_message_symbol_enum" NOT NULL, "message_id" character varying, "channel_symbol" "public"."persistent_message_channel_symbol_enum" NOT NULL, "maintainer_symbol" "public"."persistent_message_maintainer_symbol_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_274fb44ef99a1095ceebb65a72f" UNIQUE ("symbol"), CONSTRAINT "PK_70059a53b20861219389a8fffb0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pledge" ("id" SERIAL NOT NULL, "yld" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" integer, CONSTRAINT "PK_45ccbbcda634f9a57e8b9c41fee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tenancy_type_enum" AS ENUM('AUTHORITY', 'GUEST')`);
        await queryRunner.query(`CREATE TABLE "tenancy" ("id" SERIAL NOT NULL, "discord_channel_id" character varying NOT NULL, "type" "public"."tenancy_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "district_id" integer, "user_id" integer, CONSTRAINT "PK_c98009ac41a45bd29d8a56431ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_126ac482f5c47199b498152e6b" ON "tenancy" ("discord_channel_id") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "discord_id" character varying NOT NULL, "display_name" character varying NOT NULL, "gbt" integer, "strength" integer, "in_game" boolean NOT NULL DEFAULT false, "welcome_mention_made_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a695038a038c00cf6573529962" ON "user" ("discord_id") `);
        await queryRunner.query(`CREATE TYPE "public"."district_symbol_enum" AS ENUM('PROJECTS_D1', 'PROJECTS_D2', 'PROJECTS_D3', 'PROJECTS_D4', 'PROJECTS_D5', 'PROJECTS_D6')`);
        await queryRunner.query(`CREATE TABLE "district" ("id" SERIAL NOT NULL, "symbol" "public"."district_symbol_enum" NOT NULL, "open" boolean NOT NULL DEFAULT false, "emoji" character varying, "active_emoji" character varying, "inactive_emoji" character varying, "allowance" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee5cb6fd5223164bb87ea693f1e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e46d3dd3640cdadb3bab42cfeb" ON "district" ("symbol") `);
        await queryRunner.query(`CREATE TABLE "user_achievements_achievement" ("user_id" integer NOT NULL, "achievement_id" integer NOT NULL, CONSTRAINT "PK_40522c474154b49ddafcd87f973" PRIMARY KEY ("user_id", "achievement_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bfda33641b0ac19ab5521d8e29" ON "user_achievements_achievement" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f35d7af39d07a3e8308f984e58" ON "user_achievements_achievement" ("achievement_id") `);
        await queryRunner.query(`ALTER TABLE "imprisonment" ADD CONSTRAINT "FK_91fa2d58b0579e5b386b29dccfe" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mart_item_ownership" ADD CONSTRAINT "FK_3cc7ab6831c81f2c38db40a5580" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mart_item_ownership" ADD CONSTRAINT "FK_72982b4a3f2d0f74ff1fcb999dd" FOREIGN KEY ("item_id") REFERENCES "mart_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pledge" ADD CONSTRAINT "FK_76fef75f44e92b14f0463cd3a3b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenancy" ADD CONSTRAINT "FK_3a4f1eb60329859acf4c0fb58af" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenancy" ADD CONSTRAINT "FK_44e599b0047f13441e23faa9e73" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_achievements_achievement" ADD CONSTRAINT "FK_bfda33641b0ac19ab5521d8e293" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_achievements_achievement" ADD CONSTRAINT "FK_f35d7af39d07a3e8308f984e587" FOREIGN KEY ("achievement_id") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_achievements_achievement" DROP CONSTRAINT "FK_f35d7af39d07a3e8308f984e587"`);
        await queryRunner.query(`ALTER TABLE "user_achievements_achievement" DROP CONSTRAINT "FK_bfda33641b0ac19ab5521d8e293"`);
        await queryRunner.query(`ALTER TABLE "tenancy" DROP CONSTRAINT "FK_44e599b0047f13441e23faa9e73"`);
        await queryRunner.query(`ALTER TABLE "tenancy" DROP CONSTRAINT "FK_3a4f1eb60329859acf4c0fb58af"`);
        await queryRunner.query(`ALTER TABLE "pledge" DROP CONSTRAINT "FK_76fef75f44e92b14f0463cd3a3b"`);
        await queryRunner.query(`ALTER TABLE "mart_item_ownership" DROP CONSTRAINT "FK_72982b4a3f2d0f74ff1fcb999dd"`);
        await queryRunner.query(`ALTER TABLE "mart_item_ownership" DROP CONSTRAINT "FK_3cc7ab6831c81f2c38db40a5580"`);
        await queryRunner.query(`ALTER TABLE "imprisonment" DROP CONSTRAINT "FK_91fa2d58b0579e5b386b29dccfe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f35d7af39d07a3e8308f984e58"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfda33641b0ac19ab5521d8e29"`);
        await queryRunner.query(`DROP TABLE "user_achievements_achievement"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e46d3dd3640cdadb3bab42cfeb"`);
        await queryRunner.query(`DROP TABLE "district"`);
        await queryRunner.query(`DROP TYPE "public"."district_symbol_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a695038a038c00cf6573529962"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_126ac482f5c47199b498152e6b"`);
        await queryRunner.query(`DROP TABLE "tenancy"`);
        await queryRunner.query(`DROP TYPE "public"."tenancy_type_enum"`);
        await queryRunner.query(`DROP TABLE "pledge"`);
        await queryRunner.query(`DROP TABLE "persistent_message"`);
        await queryRunner.query(`DROP TYPE "public"."persistent_message_maintainer_symbol_enum"`);
        await queryRunner.query(`DROP TYPE "public"."persistent_message_channel_symbol_enum"`);
        await queryRunner.query(`DROP TYPE "public"."persistent_message_symbol_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_50003c20dc6b7f3e5b0a160bfe"`);
        await queryRunner.query(`DROP TABLE "npc"`);
        await queryRunner.query(`DROP TABLE "mart_item_ownership"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65b80781585329c4d6148f7729"`);
        await queryRunner.query(`DROP TABLE "mart_item"`);
        await queryRunner.query(`DROP TABLE "imprisonment"`);
        await queryRunner.query(`DROP TABLE "app_state"`);
        await queryRunner.query(`DROP TABLE "achievement"`);
        await queryRunner.query(`DROP TYPE "public"."achievement_symbol_enum"`);
    }

}
