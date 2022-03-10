import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrientationRoomToEnum1646903852093
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }
}
