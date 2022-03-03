import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInventory1646271266577 implements MigrationInterface {
  name = "AddInventory1646271266577";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "inventory" integer array NOT NULL DEFAULT '{}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "inventory"`);
  }
}
