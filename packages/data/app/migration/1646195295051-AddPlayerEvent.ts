import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlayerEvent1646195295051 implements MigrationInterface {
  name = "AddPlayerEvent1646195295051";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "player_event" ("id" SERIAL NOT NULL, "event_type" character varying NOT NULL, "success" boolean, "is_instigator" boolean, "item_id" integer, "cooldown" integer, "adversary_id" character varying, "adversary_name" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_a0161c17d0f9253df91314174ab" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "player_event" ADD CONSTRAINT "FK_b49df8acbc346793abc74dc91a4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_event" DROP CONSTRAINT "FK_b49df8acbc346793abc74dc91a4"`
    );
    await queryRunner.query(`DROP TABLE "player_event"`);
  }
}
