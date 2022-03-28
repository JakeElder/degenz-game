import {MigrationInterface, QueryRunner} from "typeorm";

export class AddThoughPoliceRole1648463776634 implements MigrationInterface {
    name = 'AddThoughPoliceRole1648463776634'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."role_symbol_enum" RENAME TO "role_symbol_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."role_symbol_enum" AS ENUM('ADMIN', 'DEGEN', 'EVERYONE', 'PRISONER', 'SERVER_BOOSTER', 'VERIFIED', 'TRAINEE', 'ADMIN_BOT', 'ALLY_BOT', 'ARMORY_CLERK_BOT', 'BANKER_BOT', 'BIG_BROTHER_BOT', 'DEVILS_ADVOCATE_BOT', 'MART_CLERK_BOT', 'PRISONER_BOT', 'SCOUT_BOT', 'SENSEI_BOT', 'TOSSER_BOT', 'WARDEN_BOT', 'D1_CITIZEN', 'D2_CITIZEN', 'D3_CITIZEN', 'D4_CITIZEN', 'D5_CITIZEN', 'D6_CITIZEN', 'THE_LEFT_CITIZEN', 'THE_RIGHT_CITIZEN', 'THE_GRID_CITIZEN', 'BULLSEYE_CITIZEN', 'VULTURE_CITIZEN', 'THOUGHT_POLICE')`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "symbol" TYPE "public"."role_symbol_enum" USING "symbol"::"text"::"public"."role_symbol_enum"`);
        await queryRunner.query(`DROP TYPE "public"."role_symbol_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."role_type_enum" RENAME TO "role_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."role_type_enum" AS ENUM('BASE', 'CITIZEN', 'SUPPLEMENTARY', 'MANAGED')`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "type" TYPE "public"."role_type_enum" USING "type"::"text"::"public"."role_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."role_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."role_type_enum_old" AS ENUM('BASE', 'CITIZEN', 'MANAGED')`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "type" TYPE "public"."role_type_enum_old" USING "type"::"text"::"public"."role_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."role_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."role_type_enum_old" RENAME TO "role_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."role_symbol_enum_old" AS ENUM('ADMIN', 'ADMIN_BOT', 'ALLY_BOT', 'ARMORY_CLERK_BOT', 'BANKER_BOT', 'BIG_BROTHER_BOT', 'BULLSEYE_CITIZEN', 'D1_CITIZEN', 'D2_CITIZEN', 'D3_CITIZEN', 'D4_CITIZEN', 'D5_CITIZEN', 'D6_CITIZEN', 'DEGEN', 'DEVILS_ADVOCATE_BOT', 'EVERYONE', 'MART_CLERK_BOT', 'PRISONER', 'PRISONER_BOT', 'SCOUT_BOT', 'SENSEI_BOT', 'SERVER_BOOSTER', 'THE_GRID_CITIZEN', 'THE_LEFT_CITIZEN', 'THE_RIGHT_CITIZEN', 'TOSSER_BOT', 'TRAINEE', 'VERIFIED', 'VULTURE_CITIZEN', 'WARDEN_BOT')`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "symbol" TYPE "public"."role_symbol_enum_old" USING "symbol"::"text"::"public"."role_symbol_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."role_symbol_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."role_symbol_enum_old" RENAME TO "role_symbol_enum"`);
    }

}
