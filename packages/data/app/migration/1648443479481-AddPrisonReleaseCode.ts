import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPrisonReleaseCode1648443479481 implements MigrationInterface {
  name = "AddPrisonReleaseCode1648443479481";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "imprisonment" ADD "release_code" character varying NOT NULL DEFAULT '2345'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "imprisonment" DROP COLUMN "release_code"`
    );
  }
}
