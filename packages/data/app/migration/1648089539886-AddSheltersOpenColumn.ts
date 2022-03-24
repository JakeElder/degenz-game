import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSheltersOpenColumn1648089539886 implements MigrationInterface {
  name = "AddSheltersOpenColumn1648089539886";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_state" ADD "shelters_open" boolean NOT NULL DEFAULT true`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_state" DROP COLUMN "shelters_open"`
    );
  }
}
