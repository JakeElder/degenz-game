import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeBunkToOnboarding1648277621585 implements MigrationInterface {
  name = "ChangeBunkToOnboarding1648277621585";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dormitory_tenancy" RENAME COLUMN "bunk_thread_id" TO "onboarding_thread_id"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dormitory_tenancy" RENAME COLUMN "onboarding_thread_id" TO "bunk_thread_id"`
    );
  }
}
