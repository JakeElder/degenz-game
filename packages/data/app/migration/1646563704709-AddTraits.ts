import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTraits1646563704709 implements MigrationInterface {
  name = "AddTraits1646563704709";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "focus" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "charisma" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "luck" integer NOT NULL DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "luck"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "charisma"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "focus"`);
  }
}
